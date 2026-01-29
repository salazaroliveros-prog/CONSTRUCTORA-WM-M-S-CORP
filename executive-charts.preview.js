(function () {
  const canvas = document.getElementById('costChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const ctx = canvas.getContext('2d');

  // Gradiente sutil (ejecutivo)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 180);
  gradient.addColorStop(0, 'rgba(212, 175, 55, 0.28)');
  gradient.addColorStop(1, 'rgba(212, 175, 55, 0.00)');

  Chart.defaults.font.family = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Liberation Sans, sans-serif';
  Chart.defaults.color = 'rgba(255,255,255,0.78)';

  const data = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
    datasets: [
      {
        label: 'Costo directo (GTQ)',
        data: [110, 128, 123, 142, 155, 149].map(v => v * 1000),
        borderColor: 'rgba(212, 175, 55, 0.95)',
        backgroundColor: gradient,
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgba(212, 175, 55, 0.95)',
        pointBorderColor: 'rgba(0, 19, 38, 1)',
        pointBorderWidth: 2,
        borderWidth: 2
      },
      {
        label: 'Mano de obra (GTQ)',
        data: [44, 46, 45, 49, 52, 51].map(v => v * 1000),
        borderColor: 'rgba(23, 162, 184, 0.95)',
        backgroundColor: 'rgba(23, 162, 184, 0.10)',
        tension: 0.35,
        fill: false,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2
      }
    ]
  };

  const chart = new Chart(ctx, {
    type: 'line',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { usePointStyle: true, boxWidth: 10, boxHeight: 10 }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 19, 38, 0.92)',
          borderColor: 'rgba(212, 175, 55, 0.28)',
          borderWidth: 1,
          titleColor: 'rgba(255,255,255,0.92)',
          bodyColor: 'rgba(255,255,255,0.86)',
          padding: 10,
          displayColors: true,
          callbacks: {
            label: (ctx) => {
              const v = Number(ctx.parsed.y || 0);
              return `${ctx.dataset.label}: GTQ ${v.toLocaleString('es-GT')}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: { color: 'rgba(255,255,255,0.72)' }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: {
            color: 'rgba(255,255,255,0.72)',
            callback: (v) => `GTQ ${(Number(v) / 1000).toFixed(0)}k`
          }
        }
      }
    }
  });

  // Pequeño “toque ejecutivo”: animación suave al cargar
  chart.update();
})();
