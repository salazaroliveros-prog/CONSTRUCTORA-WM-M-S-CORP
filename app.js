// ===== APLICACIÓN DE CONTROL Y SEGUIMIENTO DE PROYECTOS =====
// Constructora M&S - Versión 2.0
// Archivo principal de funcionalidades comunes

// ===== CONFIGURACIÓN GLOBAL =====
const APP_CONFIG = {
    nombre: 'Sistema M&S',
    version: '2.0',
    empresa: 'CONSTRUCTORA WM/M&S',
    eslogan: 'EDIFICANDO EL FUTURO',
    moneda: 'GTQ', // Quetzal guatemalteco
    sincronizacionAutomatica: true,
    modoOffline: true,
    tiempoSincronizacion: 30000, // 30 segundos
    serviciosCloud: ['local', 'google_sheets', 'supabase', 'firestore']
};

// ===== BASE DE DATOS LOCAL =====
class Database {
    constructor() {
        this.prefix = 'ms_constructora_';
        this.init();
    }

    getBackend() {
        try {
            if (window.AdvancedDB && typeof window.AdvancedDB.get === 'function') {
                return window.AdvancedDB;
            }
        } catch (_) {
            // ignore
        }
        return null;
    }

    init() {
        // Si AdvancedDB está disponible, no inicializamos almacenamiento paralelo.
        if (this.getBackend()) return;

        // Inicializar estructura básica si no existe
        if (!this.get('config')) {
            this.set('config', {
                inicializado: new Date().toISOString(),
                version: APP_CONFIG.version,
                moneda: APP_CONFIG.moneda,
                sincronizacion: APP_CONFIG.sincronizacionAutomatica
            });
        }

        // Inicializar colecciones principales
        const colecciones = [
            'proyectos',
            'transacciones',
            'presupuestos',
            'materiales',
            'proveedores',
            'trabajadores',
            'asistencias',
            'compras',
            'alertas',
            'logs'
        ];

        colecciones.forEach(coleccion => {
            if (!this.get(coleccion)) {
                this.set(coleccion, []);
            }
        });
    }

    // Métodos CRUD básicos
    get(key) {
        const backend = this.getBackend();
        if (backend) {
            const value = backend.get(key);
            return value == null ? null : value;
        }
        const data = localStorage.getItem(this.prefix + key);
        return data ? JSON.parse(data) : null;
    }

    set(key, value) {
        const backend = this.getBackend();
        if (backend) {
            // AdvancedDB maneja el storage; mantenemos evento para compatibilidad.
            const ok = backend.set(key, value);
            this.emitEvent('change', { key, value });
            return ok;
        }
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
        this.emitEvent('change', { key, value });
        return true;
    }

    // Métodos específicos para colecciones
    insert(collection, data) {
        const backend = this.getBackend();
        if (backend && typeof backend.insert === 'function') {
            const item = backend.insert(collection, data);
            this.emitEvent('change', { key: collection, value: backend.get(collection) });
            return item;
        }
        const items = this.get(collection) || [];
        const id = this.generateId();
        const item = {
            id,
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active'
        };
        items.push(item);
        this.set(collection, items);
        return item;
    }

    update(collection, id, data) {
        const backend = this.getBackend();
        if (backend && typeof backend.update === 'function') {
            const item = backend.update(collection, id, data);
            this.emitEvent('change', { key: collection, value: backend.get(collection) });
            return item;
        }
        const items = this.get(collection) || [];
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = {
                ...items[index],
                ...data,
                updatedAt: new Date().toISOString()
            };
            this.set(collection, items);
            return items[index];
        }
        return null;
    }

    delete(collection, id) {
        const backend = this.getBackend();
        if (backend && typeof backend.delete === 'function') {
            const ok = backend.delete(collection, id);
            this.emitEvent('change', { key: collection, value: backend.get(collection) });
            return ok;
        }
        const items = this.get(collection) || [];
        const filteredItems = items.filter(item => item.id !== id);
        this.set(collection, filteredItems);
        return true;
    }

    find(collection, query) {
        const backend = this.getBackend();
        if (backend) {
            try {
                if (typeof backend.find === 'function') {
                    return backend.find(collection, query) || [];
                }
            } catch (_) {
                // fallback a filtro manual
            }
            const items = backend.get(collection) || [];
            return items.filter(item => {
                return Object.keys(query).every(key => {
                    if (key === 'id') return item[key] === query[key];
                    return String(item[key]).toLowerCase().includes(String(query[key]).toLowerCase());
                });
            });
        }
        const items = this.get(collection) || [];
        return items.filter(item => {
            return Object.keys(query).every(key => {
                if (key === 'id') return item[key] === query[key];
                return String(item[key]).toLowerCase().includes(String(query[key]).toLowerCase());
            });
        });
    }

    findOne(collection, query) {
        const backend = this.getBackend();
        if (backend) {
            try {
                if (typeof backend.findOne === 'function') {
                    return backend.findOne(collection, query) || null;
                }
            } catch (_) {
                // fallback
            }
            const items = backend.get(collection) || [];
            return items.find(item => {
                return Object.keys(query).every(key => item[key] === query[key]);
            }) || null;
        }
        const items = this.get(collection) || [];
        return items.find(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    }

    // Generar ID único
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Eventos
    emitEvent(event, data) {
        window.dispatchEvent(new CustomEvent('db:' + event, { detail: data }));
    }
}

// ===== SINCRONIZACIÓN CON LA NUBE =====
class CloudSync {
    constructor() {
        this.db = new Database();
        this.syncEnabled = APP_CONFIG.sincronizacionAutomatica;
        this.syncInterval = null;
        this.providers = {
            local: this.syncLocal.bind(this),
            google_sheets: this.syncGoogleSheets.bind(this),
            supabase: this.syncSupabase.bind(this),
            firestore: this.syncFirestore.bind(this)
        };
    }

    init() {
        if (this.syncEnabled) {
            this.startAutoSync();
        }
    }

    startAutoSync() {
        if (this.syncInterval) clearInterval(this.syncInterval);
        this.syncInterval = setInterval(() => {
            this.syncAll();
        }, APP_CONFIG.tiempoSincronizacion);
    }

    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    async syncAll() {
        try {
            const provider = localStorage.getItem('sync_provider') || 'local';
            const syncFunction = this.providers[provider];
            if (syncFunction) {
                await syncFunction();
                // Evitar mensaje repetitivo de éxito en sincronización automática.
                // Mantener solo notificaciones de error para no molestar en los formularios.
            }
        } catch (error) {
            console.error('Error en sincronización:', error);
            this.showNotification('Error en sincronización', 'error');
        }
    }

    async syncLocal() {
        // Simulación de sincronización local
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Sincronización local completada');
                resolve();
            }, 1000);
        });
    }

    async syncGoogleSheets() {
        // Implementación para Google Sheets
        console.log('Sincronizando con Google Sheets...');
        // Aquí iría la implementación real
    }

    async syncSupabase() {
        // Implementación para Supabase
        console.log('Sincronizando con Supabase...');
        // Aquí iría la implementación real
    }

    async syncFirestore() {
        // Implementación para Firestore
        console.log('Sincronizando con Firestore...');
        // Aquí iría la implementación real
    }

    showNotification(message, type = 'info') {
        // Mostrar notificación al usuario
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.innerHTML = `
            <span class="alert-icon">${type === 'success' ? '✓' : '⚠'}</span>
            <span class="alert-content">${message}</span>
            <button class="alert-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
}

// ===== GESTIÓN DE PROYECTOS =====
class ProyectoManager {
    constructor() {
        this.db = new Database();
    }

    crearProyecto(data) {
        const proyecto = {
            ...data,
            estado: 'espera',
            codigo: this.generarCodigoProyecto(),
            avanceFisico: 0,
            avanceFinanciero: 0,
            presupuestoAprobado: 0,
            gastoReal: 0,
            fechaInicio: data.fechaInicio || null,
            fechaFinEstimada: data.fechaFinEstimada || null
        };

        return this.db.insert('proyectos', proyecto);
    }

    actualizarProyecto(id, data) {
        return this.db.update('proyectos', id, data);
    }

    obtenerProyectos(estado = null) {
        const proyectos = this.db.get('proyectos') || [];
        if (estado) {
            return proyectos.filter(p => p.estado === estado);
        }
        return proyectos;
    }

    obtenerProyecto(id) {
        const proyectos = this.db.get('proyectos') || [];
        return proyectos.find(p => p.id === id);
    }

    cambiarEstado(id, nuevoEstado) {
        return this.db.update('proyectos', id, { estado: nuevoEstado });
    }

    generarCodigoProyecto() {
        const fecha = new Date();
        const year = fecha.getFullYear().toString().substr(-2);
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const count = this.obtenerProyectos().length + 1;
        return `PROY-${year}${month}-${count.toString().padStart(3, '0')}`;
    }

    calcularMetricas(id) {
        const proyecto = this.obtenerProyecto(id);
        if (!proyecto) return null;

        const transacciones = this.db.get('transacciones') || [];
        const transaccionesProyecto = transacciones.filter(t => t.proyectoId === id);

        const ingresos = transaccionesProyecto
            .filter(t => t.tipo === 'ingreso')
            .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);

        const gastos = transaccionesProyecto
            .filter(t => t.tipo === 'gasto')
            .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);

        const presupuesto = parseFloat(proyecto.presupuestoAprobado || 0);
        const avanceFinanciero = presupuesto > 0 ? (gastos / presupuesto) * 100 : 0;

        return {
            ingresos,
            gastos,
            presupuesto,
            avanceFinanciero,
            saldo: ingresos - gastos,
            rentabilidad: presupuesto > 0 ? ((presupuesto - gastos) / presupuesto) * 100 : 0
        };
    }
}

// ===== GESTIÓN DE TRANSACCIONES =====
class TransaccionManager {
    constructor() {
        this.db = new Database();
    }

    registrarIngreso(data) {
        const transaccion = {
            ...data,
            tipo: 'ingreso',
            fecha: data.fecha || new Date().toISOString().split('T')[0],
            mes: this.obtenerMes(data.fecha),
            estado: 'completado',
            syncStatus: 'pending'
        };

        return this.db.insert('transacciones', transaccion);
    }

    registrarGasto(data) {
        const transaccion = {
            ...data,
            tipo: 'gasto',
            fecha: data.fecha || new Date().toISOString().split('T')[0],
            mes: this.obtenerMes(data.fecha),
            estado: 'completado',
            syncStatus: 'pending'
        };

        // Verificar si es alquiler para configurar alerta
        if (data.categoria === 'equipo/herramienta' && data.proveedor) {
            this.configurarAlertaAlquiler(transaccion);
        }

        return this.db.insert('transacciones', transaccion);
    }

    obtenerMes(fecha) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const date = new Date(fecha);
        return meses[date.getMonth()];
    }

    configurarAlertaAlquiler(transaccion) {
        const fechaInicio = new Date(transaccion.fechaInicio || transaccion.fecha);
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 30); // 30 días hábiles

        const alerta = {
            tipo: 'alquiler_vencimiento',
            proyectoId: transaccion.proyectoId,
            transaccionId: transaccion.id,
            mensaje: `Alquiler de ${transaccion.descripcion} vence el ${fechaFin.toLocaleDateString()}`,
            fechaVencimiento: fechaFin.toISOString(),
            fechaRecordatorio: new Date(fechaFin.setDate(fechaFin.getDate() - 3)).toISOString(), // 3 días antes
            estado: 'pendiente'
        };

        this.db.insert('alertas', alerta);
    }

    obtenerTransaccionesPorProyecto(proyectoId, tipo = null) {
        const transacciones = this.db.get('transacciones') || [];
        let filtradas = transacciones.filter(t => t.proyectoId === proyectoId);
        
        if (tipo) {
            filtradas = filtradas.filter(t => t.tipo === tipo);
        }

        return filtradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    obtenerResumenMensual(proyectoId, mes, año) {
        const transacciones = this.obtenerTransaccionesPorProyecto(proyectoId);
        
        return transacciones.reduce((resumen, t) => {
            const fecha = new Date(t.fecha);
            if (fecha.getMonth() + 1 === mes && fecha.getFullYear() === año) {
                if (t.tipo === 'ingreso') {
                    resumen.ingresos += parseFloat(t.monto || 0);
                } else {
                    resumen.gastos += parseFloat(t.monto || 0);
                }
            }
            return resumen;
        }, { ingresos: 0, gastos: 0, saldo: 0 });
    }
}

// ===== UTILIDADES =====
class Utils {
    static formatCurrency(amount, currency = APP_CONFIG.moneda) {
        return new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    }

    static formatDate(date, includeTime = false) {
        const d = new Date(date);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return d.toLocaleDateString('es-GT', options);
    }

    static getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    static getCurrentDateTime() {
        return new Date().toISOString();
    }

    static generatePDF(data, filename) {
        // Generación real de PDF usando jsPDF y autoTable
        if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
            alert('jsPDF no está cargado. Descarga https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            return;
        }
        const jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
        const doc = new jsPDF({ orientation: 'landscape' });

        const toNumber = (v, fallback = 0) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : fallback;
        };

        const ensureMetricas = (r) => {
            if (!r || typeof r !== 'object') return null;
            if (r.metricas && typeof r.metricas === 'object') return r.metricas;
            if (typeof window.calcularMetricasRenglon === 'function') {
                try {
                    window.calcularMetricasRenglon(r);
                } catch (e) {
                    // no-op
                }
            }
            return (r.metricas && typeof r.metricas === 'object') ? r.metricas : null;
        };

        doc.setFontSize(14);
        doc.text(`Presupuesto: ${data.proyecto.nombre || data.proyecto.codigo || ''}`, 10, 15);
        doc.setFontSize(10);
        doc.text(`Fecha: ${data.fechaGeneracion}  Hora: ${data.horaGeneracion}`, 10, 22);

        // Tabla de renglones (incluye métricas por renglón)
        const rows = (data.presupuesto.renglones || []).map((r, i) => {
            const m = ensureMetricas(r) || {};
            return [
                i + 1,
                r.codigo,
                r.descripcion,
                r.unidad,
                r.cantidad,
                r.precioUnitario,
                r.subtotal,
                toNumber(m.costoMateriales, ''),
                toNumber(m.costoManoObra, ''),
                toNumber(m.utilidad, ''),
                (m.diasEstimados != null ? toNumber(m.diasEstimados, 0).toFixed(2) : ''),
                toNumber(m.costoTotal, '')
            ];
        });
        doc.autoTable({
            head: [["#", "Código", "Descripción", "Unidad", "Cantidad", "P.Unitario", "Subtotal", "Materiales", "Mano de obra", "Utilidad", "Tiempo (d)", "Total"]],
            body: rows,
            startY: 28,
            theme: 'grid',
            styles: { fontSize: 7 }
        });

        // Resumen consolidado global (materiales + mano de obra)
        const renglones = (data.presupuesto.renglones || []);
        const resumenMaterialesMap = new Map();
        const resumenMOMap = new Map();

        renglones.forEach(r => {
            if (r && r.desglose && Array.isArray(r.desglose.materiales)) {
                r.desglose.materiales.forEach(m => {
                    const nombre = (m.nombre || m.material || 'Material').toString();
                    const unidad = (m.unidad || 'unidad').toString();
                    const qty = (m.total != null) ? Number(m.total) : (Number(m.cantidad) || 0);
                    const subtotal = Number(m.subtotal) || (qty * (Number(m.precio_unitario != null ? m.precio_unitario : m.precioUnitario) || 0));
                    const key = `${nombre}||${unidad}`;
                    const prev = resumenMaterialesMap.get(key) || { nombre, unidad, cantidad: 0, subtotal: 0 };
                    prev.cantidad += (Number(qty) || 0);
                    prev.subtotal += (Number(subtotal) || 0);
                    resumenMaterialesMap.set(key, prev);
                });
            }
            if (r && r.desglose && Array.isArray(r.desglose.mano_obra)) {
                r.desglose.mano_obra.forEach(mo => {
                    const oficio = (mo.oficio || 'Oficio').toString();
                    const unidad = (mo.unidad || 'jornal').toString();
                    const jornales = Number(mo.jornales) || 0;
                    const subtotal = Number(mo.subtotal) || (jornales * (Number(mo.precio_unitario != null ? mo.precio_unitario : mo.precioUnitario) || 0));
                    const key = `${oficio}||${unidad}`;
                    const prev = resumenMOMap.get(key) || { oficio, unidad, jornales: 0, subtotal: 0 };
                    prev.jornales += jornales;
                    prev.subtotal += subtotal;
                    resumenMOMap.set(key, prev);
                });
            }
        });

        const resumenMateriales = Array.from(resumenMaterialesMap.values())
            .map(x => ({
                ...x,
                precioUnitario: x.cantidad > 0 ? (x.subtotal / x.cantidad) : 0
            }))
            .sort((a, b) => (b.subtotal || 0) - (a.subtotal || 0));

        const resumenMO = Array.from(resumenMOMap.values())
            .map(x => ({
                ...x,
                precioUnitario: x.jornales > 0 ? (x.subtotal / x.jornales) : 0
            }))
            .sort((a, b) => (b.subtotal || 0) - (a.subtotal || 0));

        // Insertar tablas de resumen (si existen)
        let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 40;
        if (resumenMateriales.length > 0) {
            doc.setFontSize(11);
            doc.text('Resumen consolidado - Materiales', 10, y);
            y += 4;
            doc.autoTable({
                head: [["Material", "Unidad", "Cantidad", "P.Unitario (prom.)", "Subtotal"]],
                body: resumenMateriales.map(m => [
                    m.nombre,
                    m.unidad,
                    (m.cantidad || 0).toFixed(2),
                    (m.precioUnitario || 0).toFixed(2),
                    (m.subtotal || 0).toFixed(2)
                ]),
                startY: y,
                theme: 'grid',
                styles: { fontSize: 8 }
            });
            y = (doc.lastAutoTable ? doc.lastAutoTable.finalY : y) + 8;
        }

        if (resumenMO.length > 0) {
            doc.setFontSize(11);
            doc.text('Resumen consolidado - Mano de obra', 10, y);
            y += 4;
            doc.autoTable({
                head: [["Oficio", "Unidad", "Jornales", "P.Unitario (prom.)", "Subtotal"]],
                body: resumenMO.map(mo => [
                    mo.oficio,
                    mo.unidad,
                    (mo.jornales || 0).toFixed(2),
                    (mo.precioUnitario || 0).toFixed(2),
                    (mo.subtotal || 0).toFixed(2)
                ]),
                startY: y,
                theme: 'grid',
                styles: { fontSize: 8 }
            });
            y = (doc.lastAutoTable ? doc.lastAutoTable.finalY : y) + 8;
        }

        // Desglose de materiales y mano de obra por renglón
        renglones.forEach((r, idx) => {
            if (r.desglose && (Array.isArray(r.desglose.materiales) || Array.isArray(r.desglose.mano_obra))) {
                doc.setFontSize(10);
                doc.text(`Renglón ${idx + 1}: ${r.descripcion}`, 10, y);
                y += 5;

                const m = ensureMetricas(r) || {};
                const dias = (m.diasEstimados != null) ? toNumber(m.diasEstimados, 0).toFixed(2) : '';
                const utilidad = (m.utilidad != null) ? toNumber(m.utilidad, 0).toFixed(2) : '';
                const total = (m.costoTotal != null) ? toNumber(m.costoTotal, 0).toFixed(2) : '';
                if (dias || utilidad || total) {
                    doc.setFontSize(8);
                    doc.text(`Tiempo: ${dias || '-'} días   Utilidad: ${utilidad || '-'}   Total: ${total || '-'}`, 12, y);
                    y += 4;
                }

                if (Array.isArray(r.desglose.materiales) && r.desglose.materiales.length > 0) {
                    doc.setFontSize(9);
                    doc.text('Materiales:', 12, y);
                    y += 4;
                    const matRows = r.desglose.materiales.map(m => [
                        m.nombre || m.material || '-',
                        m.unidad || '-',
                        m.total != null ? m.total : (m.cantidad != null ? m.cantidad : '-'),
                        m.precio_unitario || m.precioUnitario || 0,
                        m.subtotal || 0
                    ]);
                    doc.autoTable({
                        head: [["Material", "Unidad", "Cantidad", "P.Unitario", "Subtotal"]],
                        body: matRows,
                        startY: y,
                        theme: 'plain',
                        styles: { fontSize: 8 },
                        margin: { left: 12 }
                    });
                    y = doc.lastAutoTable.finalY + 2;
                }
                if (Array.isArray(r.desglose.mano_obra) && r.desglose.mano_obra.length > 0) {
                    doc.setFontSize(9);
                    doc.text('Mano de obra:', 12, y);
                    y += 4;
                    const moRows = r.desglose.mano_obra.map(mo => [
                        mo.oficio || '-',
                        mo.unidad || '-',
                        mo.jornales != null ? mo.jornales.toFixed(2) : '-',
                        mo.precio_unitario || mo.precioUnitario || 0,
                        mo.subtotal || 0
                    ]);
                    doc.autoTable({
                        head: [["Oficio", "Unidad", "Jornales", "P.Unitario", "Subtotal"]],
                        body: moRows,
                        startY: y,
                        theme: 'plain',
                        styles: { fontSize: 8 },
                        margin: { left: 12 }
                    });
                    y = doc.lastAutoTable.finalY + 2;
                }
                y += 2;
            }
        });

        // Totales
        y += 6;
        doc.setFontSize(11);
        doc.text(`Total presupuesto: ${data.presupuesto.total || ''}`, 10, y);
        y += 5;
        doc.text(`Costo por m2: ${data.presupuesto.costoPorM2 || ''}`, 10, y);
        y += 5;
        doc.text(`Duración estimada: ${data.presupuesto.duracion || ''}`, 10, y);

        doc.save(`${filename}.pdf`);
    }

    static exportToCSV(data, filename) {
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const cell = row[header];
                    return typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell;
                }).join(',')
            )
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `${filename}_${this.getCurrentDate()}.csv`;
        a.click();
        
        window.URL.revokeObjectURL(url);
    }

    static importFromCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const text = e.target.result;
                const rows = text.split('\n');
                const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
                
                const data = rows.slice(1).map(row => {
                    const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = values[index];
                    });
                    return obj;
                }).filter(obj => Object.keys(obj).length > 0);
                
                resolve(data);
            };
            
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    static showLoading(message = 'Cargando...') {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        `;
        loading.id = 'global-loading';
        document.body.appendChild(loading);
    }

    static hideLoading() {
        const loading = document.getElementById('global-loading');
        if (loading) {
            loading.remove();
        }
    }

    static showModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttons.length > 0 ? `
                    <div class="modal-footer">
                        ${buttons.map(btn => `
                            <button class="btn btn-${btn.type}" onclick="${btn.onclick}">
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        return modal;
    }

    static confirm(message, onConfirm, onCancel = null) {
        const content = `
            <p>${message}</p>
        `;
        
        const modal = this.showModal('Confirmar', content, [
            {
                text: 'Cancelar',
                type: 'secondary',
                onclick: `this.closest('.modal-overlay').remove(); ${onCancel ? '(' + onCancel.toString() + ')()' : ''}`
            },
            {
                text: 'Confirmar',
                type: 'primary',
                onclick: `this.closest('.modal-overlay').remove(); ${onConfirm.toString()}()`
            }
        ]);
        
        return modal;
    }
}

// ===== RELOJ EN TIEMPO REAL =====
class RealTimeClock {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        if (this.element) {
            this.update();
            setInterval(() => this.update(), 1000);
        }
    }

    update() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        this.element.textContent = now.toLocaleDateString('es-GT', options);
    }
}

// ===== GESTIÓN DE ALERTAS =====
class AlertManager {
    constructor() {
        this.db = new Database();
        this.checkInterval = null;
    }

    startMonitoring() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.checkInterval = setInterval(() => this.checkAlerts(), 60000); // Cada minuto
    }

    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    async checkAlerts() {
        const alertas = this.db.get('alertas') || [];
        const now = new Date();
        
        alertas.forEach(alerta => {
            if (alerta.estado === 'pendiente') {
                const fechaRecordatorio = new Date(alerta.fechaRecordatorio);
                const fechaVencimiento = new Date(alerta.fechaVencimiento);
                
                if (now >= fechaRecordatorio && now < fechaVencimiento) {
                    this.showAlert(alerta);
                } else if (now >= fechaVencimiento) {
                    this.showAlert(alerta, true);
                    this.db.update('alertas', alerta.id, { estado: 'vencido' });
                }
            }
        });
    }

    showAlert(alerta, isExpired = false) {
        const title = isExpired ? '⚠ ALERTA VENCIDA' : '📅 RECORDATORIO';
        const type = isExpired ? 'danger' : 'warning';
        
        Utils.showNotification(`${title}: ${alerta.mensaje}`, type);
        
        // Si hay soporte para notificaciones push
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: alerta.mensaje,
                icon: '/icon.png'
            });
        }
    }

    createAlert(data) {
        return this.db.insert('alertas', {
            ...data,
            createdAt: new Date().toISOString(),
            estado: 'pendiente'
        });
    }
}

// ===== INICIALIZACIÓN GLOBAL =====
class App {
    constructor() {
        this.db = new Database();
        this.sync = new CloudSync();
        this.proyectoManager = new ProyectoManager();
        this.transaccionManager = new TransaccionManager();
        this.alertManager = new AlertManager();
        this.utils = Utils;
    }

    init() {
        console.log(`${APP_CONFIG.nombre} v${APP_CONFIG.version} inicializando...`);
        
        // Inicializar sincronización
        this.sync.init();
        
        // Inicializar monitoreo de alertas
        this.alertManager.startMonitoring();
        
        // Configurar reloj en tiempo real
        if (document.getElementById('realTimeClock')) {
            new RealTimeClock('realTimeClock');
        }
        
        // Configurar eventos globales
        this.setupGlobalEvents();
        
        console.log('Aplicación inicializada correctamente');
    }

    setupGlobalEvents() {
        // Eventos de sincronización
        window.addEventListener('online', () => {
            this.sync.syncAll();
            // Evitar mensaje repetitivo al reconectar.
        });

        window.addEventListener('offline', () => {
            Utils.showNotification('Modo offline activado. Los cambios se guardarán localmente.', 'warning');
        });

        // Interceptar enlaces para navegación suave
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && link.href.includes('.html') && !link.target) {
                e.preventDefault();
                this.navigateTo(link.href);
            }
        });

        // Guardar estado antes de cerrar
        window.addEventListener('beforeunload', () => {
            this.sync.syncAll();
        });
    }

    navigateTo(url) {
        Utils.showLoading('Cargando...');
        setTimeout(() => {
            window.location.href = url;
        }, 500);
    }

    logout() {
        Utils.confirm(
            '¿Está seguro que desea salir del sistema?',
            () => {
                localStorage.removeItem('session_token');
                window.location.href = 'index.html';
            }
        );
    }

    getAppInfo() {
        return {
            ...APP_CONFIG,
            proyectoCount: this.db.get('proyectos')?.length || 0,
            transaccionCount: this.db.get('transacciones')?.length || 0,
            lastSync: localStorage.getItem('last_sync') || 'Nunca',
            storageUsed: this.calculateStorageUsage()
        };
    }

    calculateStorageUsage() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('ms_constructora_')) {
                total += localStorage.getItem(key).length;
            }
        }
        return (total / 1024).toFixed(2) + ' KB';
    }
}

// ===== INSTANCIA GLOBAL =====
const app = new App();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Exportar para uso global
window.App = app;
window.Database = Database;
window.Utils = Utils;
window.ProyectoManager = ProyectoManager;
window.TransaccionManager = TransaccionManager;
window.CloudSync = CloudSync;
window.AlertManager = AlertManager;
window.RealTimeClock = RealTimeClock;