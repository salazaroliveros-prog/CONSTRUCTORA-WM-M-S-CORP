(function () {
  const qs = new URLSearchParams(location.search);
  const token = (qs.get('t') || '').trim();

  const statusEl = document.getElementById('status');
  const kpiWorker = document.getElementById('kpi-worker');
  const kpiStatus = document.getElementById('kpi-status');
  const contractEl = document.getElementById('contract');
  const lastAttEl = document.getElementById('last-att');

  const btnIn = document.getElementById('btn-in');
  const btnOut = document.getElementById('btn-out');
  const btnClear = document.getElementById('btn-clear');
  const btnSave = document.getElementById('btn-save');
  const signedNameEl = document.getElementById('signed-name');
  const noteEl = document.getElementById('att-note');

  const sb = window.SUPABASE_PUBLIC || {};
  const baseUrl = String(sb.url || '').replace(/\/$/, '');
  const anonKey = String(sb.anonKey || '').trim();

  function setStatus(msg, level) {
    statusEl.textContent = msg;
    statusEl.classList.remove('ok', 'err', 'warn');
    if (level) statusEl.classList.add(level);
  }

  function assertReady() {
    if (!token) {
      setStatus('Falta el token del trabajador. Abre el link que te envió el administrador (ej: worker.html?t=...).', 'err');
      throw new Error('missing token');
    }
    if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) {
      setStatus('Falta configurar Supabase URL en supabase.public.js', 'err');
      throw new Error('missing supabase url');
    }
    if (!anonKey) {
      setStatus('Falta configurar la anon/public key en supabase.public.js', 'err');
      throw new Error('missing anon key');
    }
  }

  async function sbRequest(path, options = {}) {
    const res = await fetch(baseUrl + path, {
      ...options,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'X-Worker-Token': token,
        ...(options.headers || {})
      }
    });
    const text = await res.text().catch(() => '');
    if (!res.ok) {
      throw new Error(`Supabase error ${res.status}: ${text || res.statusText}`);
    }
    return text ? JSON.parse(text) : null;
  }

  async function loadContract() {
    const rows = await sbRequest(`/rest/v1/ms_worker_contracts?select=token,worker_name,project_name,contract_html,status,signed_at&token=eq.${encodeURIComponent(token)}&limit=1`);
    const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
    if (!row) {
      setStatus('No se encontró tu contrato. Pide al administrador que verifique el link.', 'err');
      kpiWorker.textContent = '—';
      kpiStatus.textContent = '—';
      contractEl.textContent = '—';
      return null;
    }

    kpiWorker.textContent = row.worker_name || '—';
    const st = row.status || (row.signed_at ? 'firmado' : 'pendiente');
    kpiStatus.textContent = st;
    contractEl.innerHTML = row.contract_html || '<p>(Contrato sin contenido)</p>';

    if (row.signed_at) {
      setStatus('Contrato cargado. Ya aparece como firmado.', 'ok');
    } else {
      setStatus('Contrato cargado. Firma y guarda.', 'warn');
    }

    return row;
  }

  function getCanvas() {
    return document.getElementById('sig');
  }

  function initSignatureCanvas() {
    const canvas = getCanvas();
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111';

    let drawing = false;

    const pos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);
      return { x, y };
    };

    const start = (e) => {
      e.preventDefault();
      drawing = true;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };

    const move = (e) => {
      if (!drawing) return;
      e.preventDefault();
      const p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };

    const end = (e) => {
      if (!drawing) return;
      e.preventDefault();
      drawing = false;
      ctx.closePath();
    };

    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);

    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end, { passive: false });

    btnClear.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return { canvas };
  }

  async function saveSignature() {
    const name = String(signedNameEl.value || '').trim();
    if (!name) {
      setStatus('Escribe tu nombre para confirmar la firma.', 'warn');
      return;
    }

    const canvas = getCanvas();
    const png = canvas.toDataURL('image/png');

    btnSave.disabled = true;
    try {
      await sbRequest(`/rest/v1/ms_worker_contracts?token=eq.${encodeURIComponent(token)}`, {
        method: 'PATCH',
        headers: {
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          status: 'firmado',
          signed_at: new Date().toISOString(),
          signed_name: name,
          signature_png: png
        })
      });
      setStatus('Firma guardada. Gracias.', 'ok');
      kpiStatus.textContent = 'firmado';
    } finally {
      btnSave.disabled = false;
    }
  }

  function getGeo() {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });
  }

  async function registrarAsistencia(tipo) {
    btnIn.disabled = true;
    btnOut.disabled = true;
    try {
      const geo = await getGeo();
      const payload = {
        token,
        tipo,
        fecha: new Date().toISOString(),
        nota: String(noteEl.value || '').trim() || null,
        lat: geo?.lat ?? null,
        lng: geo?.lng ?? null,
        accuracy: geo?.accuracy ?? null
      };

      await sbRequest('/rest/v1/ms_worker_attendance', {
        method: 'POST',
        headers: {
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(payload)
      });

      lastAttEl.textContent = `${tipo.toUpperCase()} — ${new Date().toLocaleString('es-GT')} ${geo ? `(±${Math.round(geo.accuracy)}m)` : '(sin GPS)'}`;
      setStatus('Asistencia registrada.', 'ok');
    } catch (e) {
      setStatus(`Error registrando asistencia: ${e.message}`, 'err');
    } finally {
      btnIn.disabled = false;
      btnOut.disabled = false;
    }
  }

  async function init() {
    try {
      assertReady();
      initSignatureCanvas();

      btnSave.addEventListener('click', saveSignature);
      btnIn.addEventListener('click', () => registrarAsistencia('entrada'));
      btnOut.addEventListener('click', () => registrarAsistencia('salida'));

      await loadContract();
    } catch (e) {
      // status already set
      console.warn(e);
    }
  }

  init();
})();
