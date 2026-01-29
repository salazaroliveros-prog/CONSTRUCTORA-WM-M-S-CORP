// ===== SISTEMA DE SINCRONIZACIÓN COMPLETO =====
// Conectividad con múltiples servicios en la nube

class SyncManager {
    constructor() {
        this.db = window.AdvancedDB || new AdvancedDatabase();
        this.syncProviders = {};
        this.currentProvider = localStorage.getItem('sync_provider') || 'local';
        this.syncQueue = [];
        this.isSyncing = false;
        this.lastSync = localStorage.getItem('last_sync');
        this.lastSyncMetaKey = 'ms_constructora_sync_last_meta_v1';
        this.syncInterval = null;

        this.deviceIdKey = 'ms_constructora_device_id_v1';
        this.groupIdKey = 'ms_constructora_sync_group_id_v1';
        this.tombstonesKey = 'ms_constructora_sync_tombstones_v1';
        this.deviceId = this.ensureDeviceId();
        this.groupId = this.getGroupId();
        
        this.initProviders();
    }

    ensureDeviceId() {
        try {
            const existing = localStorage.getItem(this.deviceIdKey);
            if (existing) return existing;
            const id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
            localStorage.setItem(this.deviceIdKey, id);
            return id;
        } catch {
            return 'dev_' + Date.now().toString(36);
        }
    }

    getGroupId() {
        try {
            return (localStorage.getItem(this.groupIdKey) || 'default').trim() || 'default';
        } catch {
            return 'default';
        }
    }

    setGroupId(groupId) {
        const safe = String(groupId || '').trim();
        if (!safe) throw new Error('Group ID inválido');
        this.groupId = safe;
        localStorage.setItem(this.groupIdKey, safe);
        return safe;
    }

    getTombstones() {
        try {
            const raw = JSON.parse(localStorage.getItem(this.tombstonesKey)) || [];
            return Array.isArray(raw) ? raw : [];
        } catch {
            return [];
        }
    }

    addTombstone(collection, id) {
        const tombstones = this.getTombstones();
        const entry = {
            collection: String(collection || ''),
            id: String(id || ''),
            deletedAt: new Date().toISOString()
        };
        if (!entry.collection || !entry.id) return;
        tombstones.push(entry);
        // limitar crecimiento
        const trimmed = tombstones.slice(-2000);
        localStorage.setItem(this.tombstonesKey, JSON.stringify(trimmed));
    }

    buildSnapshot() {
        const collections = {};
        (this.config?.collections || []).forEach((c) => {
            try {
                collections[c] = this.db.get(c) || [];
            } catch {
                collections[c] = [];
            }
        });
        return {
            groupId: this.groupId,
            deviceId: this.deviceId,
            at: new Date().toISOString(),
            collections,
            tombstones: this.getTombstones()
        };
    }

    parseItemUpdatedMs(item) {
        if (!item) return 0;
        const iso = item.updatedAt || item.createdAt || null;
        const ms = iso ? Date.parse(iso) : 0;
        return Number.isFinite(ms) ? ms : 0;
    }

    mergeCollectionsById(localArr, remoteArr) {
        const local = Array.isArray(localArr) ? localArr : [];
        const remote = Array.isArray(remoteArr) ? remoteArr : [];

        const byId = new Map();
        for (const item of local) {
            if (!item || !item.id) continue;
            byId.set(String(item.id), item);
        }
        for (const r of remote) {
            if (!r || !r.id) continue;
            const id = String(r.id);
            const l = byId.get(id);
            if (!l) {
                byId.set(id, r);
                continue;
            }
            const lMs = this.parseItemUpdatedMs(l);
            const rMs = this.parseItemUpdatedMs(r);
            if (rMs >= lMs) byId.set(id, r);
        }
        // mantener items locales sin id también
        const localsNoId = local.filter(x => x && !x.id);
        return [...byId.values(), ...localsNoId];
    }

    // ===== ESTADO DE SINCRONIZACIÓN (para UI y otras pantallas) =====
    getLastSyncMeta() {
        try {
            return JSON.parse(localStorage.getItem(this.lastSyncMetaKey)) || null;
        } catch {
            return null;
        }
    }

    setLastSyncMeta(meta) {
        const safe = {
            state: meta?.state || 'idle', // idle|syncing|success|error
            message: meta?.message || '',
            provider: this.currentProvider,
            at: meta?.at || new Date().toISOString()
        };

        localStorage.setItem(this.lastSyncMetaKey, JSON.stringify(safe));
        return safe;
    }

    // ===== INICIALIZACIÓN =====
    init() {
        console.log('Inicializando sistema de sincronización...');
        
        // Cargar configuración de sincronización
        this.loadConfig();

        // Cargar cola pendiente
        try {
            const stored = JSON.parse(localStorage.getItem('sync_queue')) || [];
            this.syncQueue = Array.isArray(stored) ? stored : [];
        } catch {
            this.syncQueue = [];
        }

        // Refrescar groupId por si cambió en otra pestaña
        this.groupId = this.getGroupId();
        
        // Iniciar sincronización automática si está habilitada
        if (this.config.autoSync) {
            this.startAutoSync();
        }
        
        // Escuchar eventos de conexión
        window.addEventListener('online', () => this.onConnectionRestored());
        window.addEventListener('offline', () => this.onConnectionLost());
        
        // Escuchar eventos de la base de datos
        this.db.on('insert', (data) => this.queueForSync('insert', data));
        this.db.on('update', (data) => this.queueForSync('update', data));
        this.db.on('delete', (data) => this.queueForSync('delete', data));
        
        console.log('Sistema de sincronización listo');
    }

    initProviders() {
        // Proveedor Local (siempre disponible)
        this.syncProviders.local = {
            name: 'Local Storage',
            type: 'local',
            config: {},
            sync: async (operation, payload) => this.syncLocal(operation, payload),
            test: async () => true
        };

        // Proveedor Google Sheets
        this.syncProviders.google_sheets = {
            name: 'Google Sheets',
            type: 'cloud',
            config: {},
            sync: async (operation, payload) => this.syncGoogleSheets(operation, payload),
            test: async () => this.testGoogleSheets()
        };

        // Proveedor Supabase
        this.syncProviders.supabase = {
            name: 'Supabase',
            type: 'cloud',
            config: {},
            sync: async (operation, payload) => this.syncSupabase(operation, payload),
            test: async () => this.testSupabase()
        };

        // Proveedor Firestore
        this.syncProviders.firestore = {
            name: 'Firestore',
            type: 'cloud',
            config: {},
            sync: async (operation, payload) => this.syncFirestore(operation, payload),
            test: async () => this.testFirestore()
        };

        // Proveedor REST API Genérico
        this.syncProviders.rest = {
            name: 'REST API',
            type: 'cloud',
            config: {},
            sync: async (operation, payload) => this.syncRestAPI(operation, payload),
            test: async () => this.testRestAPI()
        };
    }

    // ===== CONFIGURACIÓN =====
    loadConfig() {
        const defaultConfig = {
            autoSync: true,
            syncInterval: 30000, // 30 segundos
            syncOnStartup: true,
            syncOnConnection: true,
            maxRetries: 3,
            retryDelay: 5000,
            collections: ['proyectos', 'transacciones', 'presupuestos', 'materiales', 'proveedores', 'trabajadores', 'asistencias', 'compras', 'alertas', 'rendimientos']
        };
        
        this.config = JSON.parse(localStorage.getItem('sync_config')) || defaultConfig;
        localStorage.setItem('sync_config', JSON.stringify(this.config));
    }

    saveConfig(config) {
        this.config = { ...this.config, ...config };
        localStorage.setItem('sync_config', JSON.stringify(this.config));
        
        if (config.autoSync !== undefined) {
            if (config.autoSync) {
                this.startAutoSync();
            } else {
                this.stopAutoSync();
            }
        }
    }

    // ===== COLA DE SINCRONIZACIÓN =====
    queueForSync(operation, data) {
        if (operation === 'delete') {
            try {
                if (data?.collection && data?.id) this.addTombstone(data.collection, data.id);
            } catch {}
        }
        const queueItem = {
            id: this.generateQueueId(),
            operation,
            data,
            timestamp: new Date().toISOString(),
            retries: 0,
            status: 'pending'
        };
        
        this.syncQueue.push(queueItem);
        localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
        
        // Iniciar sincronización si no está en proceso
        // (modo silencioso para evitar notificaciones de éxito repetitivas en auto-sync)
        if (!this.isSyncing && this.config.syncOnConnection && navigator.onLine) {
            this.processQueue({ silent: true });
        }
        
        return queueItem.id;
    }

    async processQueue(options = {}) {
        if (this.isSyncing || this.syncQueue.length === 0) return;
        
        this.isSyncing = true;
        this.setLastSyncMeta({ state: 'syncing', message: 'Procesando cola' });
        const provider = this.syncProviders[this.currentProvider];
        
        if (!provider) {
            console.error('Proveedor de sincronización no disponible');
            this.setLastSyncMeta({ state: 'error', message: 'Proveedor no disponible' });
            this.isSyncing = false;
            return;
        }
        
        try {
            // Estrategia: si es proveedor cloud, hacer un sync completo (push+pull) una vez.
            if (provider.type === 'cloud') {
                await provider.sync('full', { snapshot: this.buildSnapshot() });
                // marcar cola como procesada
                this.syncQueue.forEach(i => { if (i && i.status === 'pending') i.status = 'synced'; });
            } else {
                // Local: solo marcar como synced
                this.syncQueue.forEach(i => { if (i && i.status === 'pending') i.status = 'synced'; });
            }

            // Limpiar items exitosos
            this.syncQueue = this.syncQueue.filter(item => item.status !== 'synced');
            localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));

            // Actualizar última sincronización
            this.lastSync = new Date().toISOString();
            localStorage.setItem('last_sync', this.lastSync);
            this.setLastSyncMeta({ state: 'success', message: 'Cola sincronizada', at: this.lastSync });
            // No mostrar toast de éxito (evitar mensaje verde repetitivo).
        } catch (error) {
            console.error('Error en proceso de sincronización:', error);
            this.setLastSyncMeta({ state: 'error', message: error?.message || 'Error procesando cola' });
            this.showNotification('Error en sincronización', 'error');
        } finally {
            this.isSyncing = false;
        }
    }

    generateQueueId() {
        return 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ===== PROVEEDORES DE SINCRONIZACIÓN =====
    
    // 1. Sincronización Local
    async syncLocal(operation, payload) {
        // Para sincronización local, solo actualizamos el estado
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Sincronización local completada');
                resolve();
            }, 500);
        });
    }

    // 2. Google Sheets
    async syncGoogleSheets(operation, payload) {
        const config = this.getProviderConfig('google_sheets');
        
        if (!config.sheetId || !config.apiKey) {
            throw new Error('Configuración de Google Sheets incompleta');
        }
        
        // Implementación real requeriría OAuth2 y Google Sheets API
        console.log('Sincronizando con Google Sheets...');
        
        // Aquí iría la implementación real con fetch a Google Sheets API
        // Por ahora es una simulación
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% de éxito simulado
                    console.log('Google Sheets sincronizado exitosamente');
                    resolve();
                } else {
                    reject(new Error('Error de conexión con Google Sheets'));
                }
            }, 2000);
        });
    }

    async testGoogleSheets() {
        const config = this.getProviderConfig('google_sheets');
        return !!(config.sheetId && config.apiKey);
    }

    // 3. Supabase
    async syncSupabase(operation, payload) {
        const config = this.getProviderConfig('supabase');

        if (!config.url || !config.key) {
            throw new Error('Configuración de Supabase incompleta');
        }

        const normalizeSupabaseUrl = (raw) => {
            const s = String(raw || '').trim();
            if (!s) return '';
            const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
            return withProto.replace(/\/$/, '');
        };

        const baseUrl = normalizeSupabaseUrl(config.url);
        const anonKey = String(config.key).trim();
        const table = String(config.table || 'ms_constructora_state').trim();
        const schemaProfile = String(config.schema || 'public').trim() || 'public';

        const request = async (path, options = {}) => {
            const res = await fetch(baseUrl + path, {
                ...options,
                headers: {
                    apikey: anonKey,
                    Authorization: `Bearer ${anonKey}`,
                    'Content-Type': 'application/json',
                    // Importante: fuerza el schema donde está la tabla.
                    // Soluciona el error PGRST205 cuando PostgREST busca en schema distinto (ej: api).
                    'Accept-Profile': schemaProfile,
                    'Content-Profile': schemaProfile,
                    ...(options.headers || {})
                }
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                throw new Error(`Supabase error ${res.status}: ${txt || res.statusText}`);
            }
            // algunos endpoints pueden devolver vacío
            const text = await res.text().catch(() => '');
            return text ? JSON.parse(text) : null;
        };

        if (operation !== 'full' && operation !== 'snapshot' && operation !== 'pull' && operation !== 'push') {
            // Operaciones granulares se consolidan en sync completo.
            operation = 'full';
        }

        const groupId = this.groupId;
        const localSnapshot = payload?.snapshot || this.buildSnapshot();

        // 1) Push snapshot
        if (operation === 'full' || operation === 'push' || operation === 'snapshot') {
            await request(`/rest/v1/${encodeURIComponent(table)}?on_conflict=group_id`, {
                method: 'POST',
                headers: {
                    Prefer: 'resolution=merge-duplicates,return=minimal'
                },
                body: JSON.stringify([
                    {
                        group_id: groupId,
                        device_id: this.deviceId,
                        payload: localSnapshot,
                        updated_at: new Date().toISOString()
                    }
                ])
            });
        }

        // 2) Pull latest snapshot
        let remoteRow = null;
        if (operation === 'full' || operation === 'pull') {
            const rows = await request(`/rest/v1/${encodeURIComponent(table)}?select=group_id,device_id,updated_at,payload&group_id=eq.${encodeURIComponent(groupId)}&order=updated_at.desc&limit=1`);
            if (Array.isArray(rows) && rows.length) remoteRow = rows[0];
        }

        // 3) Merge remote into local
        if (remoteRow && remoteRow.payload && remoteRow.payload.collections) {
            const remote = remoteRow.payload;
            const collections = this.config.collections || [];
            for (const c of collections) {
                const localArr = this.db.get(c) || [];
                const remoteArr = remote.collections[c] || [];
                const merged = this.mergeCollectionsById(localArr, remoteArr);
                this.db.set(c, merged);
            }

            // Aplicar tombstones remotos
            const remoteTombs = Array.isArray(remote.tombstones) ? remote.tombstones : [];
            if (remoteTombs.length) {
                for (const t of remoteTombs) {
                    const col = String(t?.collection || '');
                    const id = String(t?.id || '');
                    if (!col || !id) continue;
                    try {
                        const arr = this.db.get(col) || [];
                        const filtered = Array.isArray(arr) ? arr.filter(it => String(it?.id) !== id) : [];
                        this.db.set(col, filtered);
                    } catch {}
                }

                // Unir tombstones (union simple)
                const current = this.getTombstones();
                const keyOf = (x) => `${x.collection}::${x.id}`;
                const map = new Map(current.map(x => [keyOf(x), x]));
                for (const t of remoteTombs) {
                    if (!t?.collection || !t?.id) continue;
                    const k = keyOf({ collection: String(t.collection), id: String(t.id) });
                    if (!map.has(k)) map.set(k, { collection: String(t.collection), id: String(t.id), deletedAt: t.deletedAt || new Date().toISOString() });
                }
                localStorage.setItem(this.tombstonesKey, JSON.stringify([...map.values()].slice(-2000)));
            }
        }

        console.log('Supabase sincronizado');
    }

    async testSupabase() {
        const config = this.getProviderConfig('supabase');
        return !!(config.url && config.key);
    }

    // 4. Firestore
    async syncFirestore(operation, payload) {
        const config = this.getProviderConfig('firestore');
        
        if (!config.projectId || !config.apiKey) {
            throw new Error('Configuración de Firestore incompleta');
        }
        
        console.log('Sincronizando con Firestore...');
        
        // Simulación de sincronización con Firestore
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    console.log('Firestore sincronizado exitosamente');
                    resolve();
                } else {
                    reject(new Error('Error de conexión con Firestore'));
                }
            }, 1800);
        });
    }

    async testFirestore() {
        const config = this.getProviderConfig('firestore');
        return !!(config.projectId && config.apiKey);
    }

    // 5. REST API Genérica
    async syncRestAPI(operation, payload) {
        const config = this.getProviderConfig('rest');
        
        if (!config.endpoint || !config.apiKey) {
            throw new Error('Configuración de REST API incompleta');
        }
        
        console.log('Sincronizando con REST API...');
        
        // Implementación real con fetch
        try {
            const collections = this.config.collections;
            const syncData = {};
            collections.forEach(collection => {
                const data = this.db.get(collection);
                if (data) syncData[collection] = data;
            });
            
            // Enviar datos al servidor
            const response = await fetch(config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.apiKey}`
                },
                body: JSON.stringify({
                    action: 'sync',
                    data: syncData,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('REST API sincronizada exitosamente:', result);
            
        } catch (error) {
            console.error('Error sincronizando con REST API:', error);
            throw error;
        }
    }

    async testRestAPI() {
        const config = this.getProviderConfig('rest');
        
        if (!config.endpoint || !config.apiKey) {
            return false;
        }
        
        try {
            const response = await fetch(`${config.endpoint}/test`, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`
                }
            });
            
            return response.ok;
        } catch {
            return false;
        }
    }

    // ===== GESTIÓN DE PROVEEDORES =====
    getProviderConfig(provider) {
        const configs = JSON.parse(localStorage.getItem('provider_configs')) || {};
        const defaults = {
            // Prefill seguro: solo URL (sin API key)
            supabase: {
                url: 'https://slbzwylbnzzarrxejpql.supabase.co',
                table: 'ms_constructora_state',
                schema: 'public'
            }
        };

        return {
            ...(defaults[provider] || {}),
            ...(configs[provider] || {})
        };
    }

    saveProviderConfig(provider, config) {
        const configs = JSON.parse(localStorage.getItem('provider_configs')) || {};
        configs[provider] = config;
        localStorage.setItem('provider_configs', JSON.stringify(configs));
    }

    setProvider(provider) {
        if (!this.syncProviders[provider]) {
            throw new Error(`Proveedor ${provider} no disponible`);
        }
        
        this.currentProvider = provider;
        localStorage.setItem('sync_provider', provider);
        
        this.showNotification(`Proveedor cambiado a: ${this.syncProviders[provider].name}`, 'info');
    }

    getAvailableProviders() {
        return Object.keys(this.syncProviders).map(key => ({
            id: key,
            name: this.syncProviders[key].name,
            type: this.syncProviders[key].type,
            configured: this.isProviderConfigured(key)
        }));
    }

    isProviderConfigured(provider) {
        const config = this.getProviderConfig(provider);
        
        switch (provider) {
            case 'google_sheets':
                return !!(config.sheetId && config.apiKey);
            case 'supabase':
                return !!(config.url && config.key);
            case 'firestore':
                return !!(config.projectId && config.apiKey);
            case 'rest':
                return !!(config.endpoint && config.apiKey);
            case 'local':
                return true;
            default:
                return false;
        }
    }

    // ===== SINCRONIZACIÓN MANUAL =====
    async syncNow(force = false, options = {}) {
        if (this.isSyncing && !force) {
            this.showNotification('Sincronización ya en progreso', 'warning');
            return;
        }

        const silent = !!options?.silent;

        if (!silent) {
            this.showNotification('Iniciando sincronización...', 'info');
        }
        this.setLastSyncMeta({ state: 'syncing', message: 'Sincronización manual' });
        
        try {
            // Sincronizar todas las colecciones configuradas
            await this.syncAllCollections();
            
            // Procesar cola pendiente
            await this.processQueue({ silent });
            
            // No mostrar toast de éxito (evitar mensaje verde repetitivo).
            this.setLastSyncMeta({ state: 'success', message: 'Sincronización completada', at: this.lastSync || new Date().toISOString() });
            
        } catch (error) {
            console.error('Error en sincronización manual:', error);
            this.showNotification(`Error en sincronización: ${error.message}`, 'error');
            this.setLastSyncMeta({ state: 'error', message: error?.message || 'Error en sincronización' });
        }
    }

    async syncAllCollections() {
        const provider = this.syncProviders[this.currentProvider];
        
        if (!provider) {
            throw new Error('Proveedor de sincronización no configurado');
        }
        
        // Verificar conectividad
        const isConfigured = await provider.test();
        if (!isConfigured) {
            throw new Error('Proveedor no configurado correctamente');
        }
        
        // Para proveedor local, no hay nada que subir/bajar.
        if (provider.type === 'local') return;

        // Para proveedores cloud: sincronización de snapshot completa.
        await provider.sync('full', { snapshot: this.buildSnapshot() });
    }

    async syncCollection(collection, provider) {
        const localData = this.db.get(collection) || [];
        
        if (localData.length === 0) {
            return; // No hay datos para sincronizar
        }
        
        console.log(`Sincronizando colección ${collection} con ${localData.length} items...`);
        
        // En una implementación real, aquí se enviarían los datos al proveedor
        // Por ahora, solo registramos la acción
        // Método mantenido por compatibilidad: actualmente usamos snapshot.
        await provider.sync('full', { snapshot: this.buildSnapshot() });
    }

    // ===== SINCRONIZACIÓN AUTOMÁTICA =====
    startAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(() => {
            if (navigator.onLine && !this.isSyncing) {
                this.syncNow(false, { silent: true, source: 'auto' });
            }
        }, this.config.syncInterval);
        
        console.log('Sincronización automática iniciada');
    }

    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('Sincronización automática detenida');
        }
    }

    // ===== MANEJO DE CONEXIÓN =====
    onConnectionRestored() {
        console.log('Conexión restablecida');
        // Evitar mensaje repetitivo al reconectar (la barra de estado ya indica el estado).
        
        if (this.config.syncOnConnection) {
            this.syncNow(false, { silent: true, source: 'connection' });
        }
    }

    onConnectionLost() {
        console.log('Conexión perdida');
        this.showNotification('Modo offline activado. Los cambios se guardarán localmente.', 'warning');
    }

    // ===== ESTADÍSTICAS Y REPORTES =====
    getSyncStats() {
        const queue = JSON.parse(localStorage.getItem('sync_queue')) || [];
        
        return {
            lastSync: this.lastSync,
            currentProvider: this.currentProvider,
            queueSize: queue.length,
            queuePending: queue.filter(item => item.status === 'pending').length,
            queueFailed: queue.filter(item => item.status === 'failed').length,
            isSyncing: this.isSyncing,
            isOnline: navigator.onLine,
            autoSyncEnabled: this.config.autoSync,
            collectionsCount: this.config.collections.length
        };
    }

    getSyncHistory() {
        const history = JSON.parse(localStorage.getItem('sync_history')) || [];
        return history.slice(-50); // Últimos 50 registros
    }

    addSyncHistory(entry) {
        const history = JSON.parse(localStorage.getItem('sync_history')) || [];
        
        history.push({
            timestamp: new Date().toISOString(),
            provider: this.currentProvider,
            ...entry
        });
        
        // Mantener solo los últimos 100 registros
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        localStorage.setItem('sync_history', JSON.stringify(history));
    }

    // ===== UTILIDADES =====
    showNotification(message, type = 'info') {
        // Ocultar mensajes repetitivos de "actualización/sincronización exitosa".
        // Mantener errores/advertencias para no ocultar problemas reales.
        try {
            const msg = String(message || '').toLowerCase();
            const t = String(type || '').toLowerCase();
            const isSuccess = t === 'success';
            const shouldHide =
                isSuccess &&
                (msg.includes('sincroniz') || msg.includes('actualiz') || msg.includes('conexión restablecida'));
            if (shouldHide) return;
        } catch {
            // ignore
        }

        // Usar la función de notificación de la app principal si está disponible
        if (window.Utils && window.Utils.showNotification) {
            window.Utils.showNotification(message, type);
        } else {
            // Implementación básica
            const notification = document.createElement('div');
            notification.className = `sync-notification sync-${type}`;
            notification.innerHTML = `
                <span class="sync-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
                <span class="sync-message">${message}</span>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
            
            // Estilos inline para la notificación
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 9999;
                transition: opacity 0.3s;
                ${type === 'success' ? 'background: #28a745;' : 
                  type === 'error' ? 'background: #dc3545;' : 
                  'background: #17a2b8;'}
            `;
        }
    }

    // ===== RESOLUCIÓN DE CONFLICTOS =====
    async resolveConflicts(localData, remoteData) {
        const conflicts = [];
        const resolved = [];
        
        // Identificar conflictos (mismo ID, datos diferentes)
        localData.forEach(localItem => {
            const remoteItem = remoteData.find(r => r.id === localItem.id);
            
            if (remoteItem) {
                const localUpdated = new Date(localItem.updatedAt || localItem.createdAt);
                const remoteUpdated = new Date(remoteItem.updatedAt || remoteItem.createdAt);
                
                if (JSON.stringify(localItem) !== JSON.stringify(remoteItem)) {
                    conflicts.push({
                        id: localItem.id,
                        local: localItem,
                        remote: remoteItem,
                        localUpdated,
                        remoteUpdated,
                        isNewerLocal: localUpdated > remoteUpdated
                    });
                }
            }
        });
        
        // Resolver conflictos (por defecto, mantener el más reciente)
        for (const conflict of conflicts) {
            if (conflict.isNewerLocal) {
                resolved.push({
                    action: 'keep_local',
                    item: conflict.local
                });
            } else {
                resolved.push({
                    action: 'keep_remote',
                    item: conflict.remote
                });
            }
        }
        
        return resolved;
    }

    // ===== BACKUP Y RESTAURACIÓN =====
    async createBackup() {
        const backup = {};
        
        this.config.collections.forEach(collection => {
            backup[collection] = this.db.get(collection);
        });
        
        const backupStr = JSON.stringify(backup);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Guardar localmente
        localStorage.setItem(`backup_${timestamp}`, backupStr);
        
        // Opcionalmente subir al proveedor actual
        if (this.currentProvider !== 'local') {
            try {
                await this.syncProviders[this.currentProvider].sync('backup', {
                    timestamp,
                    data: backup
                });
            } catch (error) {
                console.error('Error subiendo backup:', error);
            }
        }
        
        return {
            timestamp,
            size: backupStr.length,
            collections: this.config.collections.length
        };
    }

    async restoreBackup(timestamp, source = 'local') {
        let backupData;
        
        if (source === 'local') {
            backupData = JSON.parse(localStorage.getItem(`backup_${timestamp}`));
        } else {
            // Descargar del proveedor
            backupData = await this.syncProviders[this.currentProvider].sync('restore', { timestamp });
        }
        
        if (!backupData) {
            throw new Error('Backup no encontrado');
        }
        
        // Restaurar cada colección
        Object.keys(backupData).forEach(collection => {
            if (this.config.collections.includes(collection)) {
                this.db.set(collection, backupData[collection]);
            }
        });
        
        return {
            restored: Object.keys(backupData).length,
            timestamp
        };
    }
}

// ===== INSTANCIA GLOBAL =====
const SyncService = new SyncManager();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    SyncService.init();
});

// Exportar para uso global
window.SyncService = SyncService;
window.SyncManager = SyncManager;

// ===== INTERFAZ DE USUARIO PARA SINCRONIZACIÓN =====
class SyncUI {
    constructor() {
        this.syncService = SyncService;
        this.initUI();
    }

    initUI() {
        // Crear interfaz de sincronización si no existe
        if (!document.getElementById('sync-controls')) {
            this.createSyncControls();
        }
        
        // Actualizar estado periódicamente
        setInterval(() => this.updateSyncStatus(), 5000);
    }

    createSyncControls() {
        const controls = document.createElement('div');
        controls.id = 'sync-controls';
        controls.setAttribute('role', 'region');
        controls.setAttribute('aria-label', 'Controles de sincronización');
        controls.innerHTML = `
            <div class="sync-status-bar">
                <div class="sync-info">
                    <span class="sync-icon">↻</span>
                    <span class="sync-text">Sincronización: <span id="sync-status-text">Listo</span></span>
                </div>
                <div class="sync-actions">
                    <button id="sync-min-btn" type="button" class="btn btn-sm btn-secondary" style="cursor:pointer;" aria-label="Minimizar">
                        ▾
                    </button>
                    <button id="sync-now-btn" type="button" class="btn btn-sm btn-primary" style="cursor:pointer;">
                        <span class="sync-btn-icon">↻</span> Sincronizar
                    </button>
                    <button id="sync-settings-btn" type="button" class="btn btn-sm btn-secondary" style="cursor:pointer;">
                        ⚙ Configurar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(controls);
        
        // Estilos (más pequeño, más transparente y en la parte superior)
        controls.style.cssText = `
            position: fixed;
            top: 70px;
            right: 12px;
            bottom: auto;
            left: auto;
            background: rgba(0, 31, 63, 0.72);
            border: 1px solid rgba(212, 175, 55, 0.92);
            border-radius: 10px;
            padding: 6px 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            min-width: 210px;
            max-width: 340px;
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
        `;

        // CSS interno para compactar (sin tocar styles.css global)
        if (!document.getElementById('sync-controls-style')) {
            const style = document.createElement('style');
            style.id = 'sync-controls-style';
            style.textContent = `
                #sync-controls .sync-status-bar{display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:12px; line-height:1.2;}
                #sync-controls .sync-info{display:flex; align-items:center; gap:6px; user-select:none; cursor:grab;}
                #sync-controls.dragging .sync-info{cursor:grabbing;}
                #sync-controls .sync-text{white-space:nowrap;}
                #sync-controls .sync-actions{display:flex; align-items:center; gap:6px;}
                #sync-controls .btn.btn-sm{padding:4px 8px; font-size:12px; line-height:1.1;}
                #sync-controls .sync-btn-icon{margin-right:4px;}
                #sync-controls #sync-min-btn{padding:4px 6px; min-width:28px; text-align:center;}
                #sync-controls.is-collapsed{min-width:auto; max-width:none;}
                #sync-controls.is-collapsed .sync-text{display:none;}
                #sync-controls.is-collapsed #sync-now-btn{display:none;}
                #sync-controls.is-collapsed #sync-settings-btn{display:none;}
            `;
            document.head.appendChild(style);
        }

        // Restaurar estado minimizado
        const COLLAPSE_KEY = 'ms_sync_controls_collapsed_v1';
        const minBtn = controls.querySelector('#sync-min-btn');
        const applyCollapsedState = (collapsed) => {
            controls.classList.toggle('is-collapsed', !!collapsed);
            if (minBtn) {
                minBtn.textContent = collapsed ? '▸' : '▾';
                minBtn.setAttribute('aria-label', collapsed ? 'Expandir' : 'Minimizar');
                minBtn.title = collapsed ? 'Expandir' : 'Minimizar';
            }
        };
        try {
            applyCollapsedState(localStorage.getItem(COLLAPSE_KEY) === '1');
        } catch {
            // ignore
        }

        minBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const next = !controls.classList.contains('is-collapsed');
            applyCollapsedState(next);
            try {
                localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
            } catch {
                // ignore
            }
        });

        // Restaurar posición si el usuario ya lo movió
        const POS_KEY = 'ms_sync_controls_pos_v1';
        try {
            const saved = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
            if (saved && typeof saved.top === 'number' && typeof saved.left === 'number') {
                controls.style.top = `${Math.max(0, saved.top)}px`;
                controls.style.left = `${Math.max(0, saved.left)}px`;
                controls.style.right = 'auto';
            }
        } catch {
            // ignore
        }

        // Hacer el widget movible con mouse/touch (arrastrar desde el área de estado)
        const bar = controls.querySelector('.sync-status-bar');
        const info = controls.querySelector('.sync-info');
        const isInteractiveTarget = (el) => !!el?.closest?.('button,a,input,select,textarea,label');

        let drag = null;
        const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

        const onPointerMove = (e) => {
            if (!drag) return;
            const dx = e.clientX - drag.startX;
            const dy = e.clientY - drag.startY;

            const vw = window.innerWidth || document.documentElement.clientWidth || 0;
            const vh = window.innerHeight || document.documentElement.clientHeight || 0;
            const rect = controls.getBoundingClientRect();
            const nextLeft = clamp(drag.startLeft + dx, 0, Math.max(0, vw - rect.width));
            const nextTop = clamp(drag.startTop + dy, 0, Math.max(0, vh - rect.height));

            controls.style.left = `${nextLeft}px`;
            controls.style.top = `${nextTop}px`;
            controls.style.right = 'auto';
        };

        const onPointerUp = () => {
            if (!drag) return;
            controls.classList.remove('dragging');
            try {
                const rect = controls.getBoundingClientRect();
                localStorage.setItem(POS_KEY, JSON.stringify({ top: Math.round(rect.top), left: Math.round(rect.left) }));
            } catch {
                // ignore
            }
            drag = null;
            window.removeEventListener('pointermove', onPointerMove, { capture: true });
        };

        const onPointerDown = (e) => {
            if (e.button !== undefined && e.button !== 0) return;
            if (isInteractiveTarget(e.target)) return;

            const rect = controls.getBoundingClientRect();
            drag = {
                startX: e.clientX,
                startY: e.clientY,
                startLeft: rect.left,
                startTop: rect.top
            };
            controls.classList.add('dragging');
            try {
                bar?.setPointerCapture?.(e.pointerId);
            } catch {
                // ignore
            }

            window.addEventListener('pointermove', onPointerMove, { capture: true });
            window.addEventListener('pointerup', onPointerUp, { capture: true, once: true });
            e.preventDefault();
        };

        info?.addEventListener('pointerdown', onPointerDown);
        bar?.addEventListener('pointerdown', onPointerDown);
        
        // Event listeners
        document.getElementById('sync-now-btn').addEventListener('click', () => {
            this.syncService.syncNow(false, { silent: false, source: 'manual' });
        });
        
        document.getElementById('sync-settings-btn').addEventListener('click', () => {
            this.showSyncSettings();
        });
    }

    showModalCompat(title, contentHtml, buttons = []) {
        // Preferir el modal global de la app si existe.
        if (window.Utils && typeof window.Utils.showModal === 'function') {
            return window.Utils.showModal(title, contentHtml, buttons);
        }

        // Fallback minimalista para páginas donde Utils no está disponible.
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.65);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
        `;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            width: min(720px, 92vw);
            max-height: 86vh;
            overflow: auto;
            background: #0b1f33;
            border: 1px solid #D4AF37;
            border-radius: 10px;
            padding: 16px;
            color: #fff;
            box-shadow: 0 14px 40px rgba(0,0,0,0.45);
        `;

        const header = document.createElement('div');
        header.style.cssText = 'display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px;';
        header.innerHTML = `
            <div style="font-weight:700; font-size:16px;">${String(title || '')}</div>
            <button type="button" aria-label="Cerrar" style="cursor:pointer; background:transparent; border:0; color:#fff; font-size:18px;">✕</button>
        `;

        const closeBtn = header.querySelector('button');
        const close = () => overlay.remove();
        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        const body = document.createElement('div');
        body.innerHTML = contentHtml;

        const footer = document.createElement('div');
        footer.style.cssText = 'display:flex; gap:10px; justify-content:flex-end; margin-top:14px; flex-wrap:wrap;';
        (buttons || []).forEach((b) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = b?.text || 'OK';
            btn.style.cssText = `
                cursor:pointer;
                border: 1px solid rgba(255,255,255,0.18);
                border-radius: 8px;
                padding: 8px 12px;
                background: ${b?.type === 'primary' ? '#3498db' : b?.type === 'info' ? '#17a2b8' : '#2c3e50'};
                color: #fff;
            `;
            btn.addEventListener('click', () => {
                try {
                    if (typeof b?.onclick === 'function') {
                        b.onclick();
                    } else {
                        // Comportamiento seguro por defecto
                        close();
                    }
                } catch {
                    close();
                }
            });
            footer.appendChild(btn);
        });

        modal.appendChild(header);
        modal.appendChild(body);
        modal.appendChild(footer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        return overlay;
    }

    updateSyncStatus() {
        const stats = this.syncService.getSyncStats();
        const meta = (typeof this.syncService.getLastSyncMeta === 'function')
            ? this.syncService.getLastSyncMeta()
            : null;
        const statusText = document.getElementById('sync-status-text');
        
        if (statusText) {
            if (stats.isSyncing) {
                statusText.textContent = 'Sincronizando...';
                statusText.style.color = '#FFC107';
            } else if (meta && meta.state === 'error') {
                statusText.textContent = 'Error de sync';
                statusText.style.color = '#DC3545';
            } else if (!stats.isOnline) {
                statusText.textContent = 'Offline';
                statusText.style.color = '#DC3545';
            } else if (stats.queuePending > 0) {
                statusText.textContent = `${stats.queuePending} pendientes`;
                statusText.style.color = '#17A2B8';
            } else {
                statusText.textContent = 'Sincronizado';
                statusText.style.color = '#28A745';
            }
        }
    }

    showSyncSettings() {
        const providers = this.syncService.getAvailableProviders();
        const currentProvider = this.syncService.currentProvider;
        const config = this.syncService.config;
        const stats = this.syncService.getSyncStats();
        const groupId = (typeof this.syncService.getGroupId === 'function') ? this.syncService.getGroupId() : 'default';
        
        let content = `
            <div class="sync-settings">
                <h4>Configuración de Sincronización</h4>
                
                <div class="form-group">
                    <label>Sincronización Automática</label>
                    <select id="auto-sync-select" class="form-control">
                        <option value="true" ${config.autoSync ? 'selected' : ''}>Activada</option>
                        <option value="false" ${!config.autoSync ? 'selected' : ''}>Desactivada</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Intervalo (segundos)</label>
                    <input type="number" id="sync-interval" class="form-control" value="${config.syncInterval / 1000}" min="10" max="3600">
                </div>

                <div class="form-group">
                    <label>Group ID (mismo en PC y móvil)</label>
                    <input type="text" id="sync-group-id" class="form-control" value="${groupId}" placeholder="Ej: wmms">
                    <small style="opacity:0.8; display:block; margin-top:6px;">Este identificador hace que ambos dispositivos compartan el mismo estado sincronizado.</small>
                </div>
                
                <div class="form-group">
                    <label>Proveedor de Sincronización</label>
                    <select id="provider-select" class="form-control">
                        ${providers.map(provider => `
                            <option value="${provider.id}" ${currentProvider === provider.id ? 'selected' : ''}>
                                ${provider.name} ${provider.configured ? '✓' : '✗'}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div id="provider-config-area"></div>
                
                <div class="sync-stats mt-3">
                    <h5>Estadísticas</h5>
                    <p>Última sincronización: ${stats.lastSync || 'Nunca'}</p>
                    <p>Pendientes en cola: ${stats.queuePending}</p>
                    <p>Estado: ${stats.isOnline ? 'Online' : 'Offline'}</p>
                </div>
            </div>
        `;
        
        this.showModalCompat('Configuración de Sincronización', content, [
            {
                text: 'Guardar',
                type: 'primary',
                onclick: () => this.saveSyncSettings()
            },
            {
                text: 'Sincronizar Ahora',
                type: 'info',
                onclick: () => {
                    this.syncService.syncNow();
                    document.querySelector('.modal-overlay')?.remove();
                }
            },
            {
                text: 'Cerrar',
                type: 'secondary',
                onclick: () => document.querySelector('.modal-overlay')?.remove()
            }
        ]);
        
        // Cargar configuración del proveedor seleccionado
        document.getElementById('provider-select').addEventListener('change', (e) => {
            this.loadProviderConfig(e.target.value);
        });
        
        this.loadProviderConfig(currentProvider);
    }

    loadProviderConfig(providerId) {
        const configArea = document.getElementById('provider-config-area');
        const provider = this.syncService.syncProviders[providerId];
        const config = this.syncService.getProviderConfig(providerId);
        
        let configHTML = '';
        
        switch (providerId) {
            case 'google_sheets':
                configHTML = `
                    <h6>Configuración de Google Sheets</h6>
                    <div class="form-group">
                        <label>ID de la Hoja</label>
                        <input type="text" id="gs-sheet-id" class="form-control" value="${config.sheetId || ''}" placeholder="Ej: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms">
                    </div>
                    <div class="form-group">
                        <label>API Key</label>
                        <input type="password" id="gs-api-key" class="form-control" value="${config.apiKey || ''}" placeholder="Tu API Key de Google">
                    </div>
                `;
                break;
                
            case 'supabase':
                configHTML = `
                    <h6>Configuración de Supabase</h6>
                    <div class="form-group">
                        <label>URL del Proyecto</label>
                        <input type="url" id="sb-url" class="form-control" value="${config.url || ''}" placeholder="https://tu-proyecto.supabase.co">
                    </div>
                    <div class="form-group">
                        <label>API Key</label>
                        <input type="password" id="sb-key" class="form-control" value="${config.key || ''}" placeholder="Tu API Key de Supabase">
                    </div>
                    <div class="form-group">
                        <label>Tabla (opcional)</label>
                        <input type="text" id="sb-table" class="form-control" value="${config.table || 'ms_constructora_state'}" placeholder="ms_constructora_state">
                        <small style="opacity:0.8; display:block; margin-top:6px;">Debe existir en Supabase y tener columnas: group_id, device_id, updated_at, payload.</small>
                    </div>
                `;
                break;
                
            case 'firestore':
                configHTML = `
                    <h6>Configuración de Firestore</h6>
                    <div class="form-group">
                        <label>ID del Proyecto</label>
                        <input type="text" id="fs-project-id" class="form-control" value="${config.projectId || ''}" placeholder="tu-proyecto-id">
                    </div>
                    <div class="form-group">
                        <label>API Key</label>
                        <input type="password" id="fs-api-key" class="form-control" value="${config.apiKey || ''}" placeholder="Tu API Key de Firebase">
                    </div>
                `;
                break;
                
            case 'rest':
                configHTML = `
                    <h6>Configuración de REST API</h6>
                    <div class="form-group">
                        <label>Endpoint</label>
                        <input type="url" id="rest-endpoint" class="form-control" value="${config.endpoint || ''}" placeholder="https://api.tudominio.com/sync">
                    </div>
                    <div class="form-group">
                        <label>API Key</label>
                        <input type="password" id="rest-api-key" class="form-control" value="${config.apiKey || ''}" placeholder="Tu API Key">
                    </div>
                `;
                break;
                
            default:
                configHTML = `<p>No se requiere configuración para ${provider.name}</p>`;
        }
        
        configArea.innerHTML = configHTML;
    }

    saveSyncSettings() {
        const isLikelyJwt = (token) => {
            const s = String(token || '').trim();
            return s.split('.').length === 3;
        };

        const decodeJwtPayload = (token) => {
            try {
                const parts = String(token || '').trim().split('.');
                if (parts.length !== 3) return null;
                const base64Url = parts[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
                const json = atob(padded);
                return JSON.parse(json);
            } catch {
                return null;
            }
        };

        // Guardar configuración general
        const autoSync = document.getElementById('auto-sync-select').value === 'true';
        const interval = parseInt(document.getElementById('sync-interval').value) * 1000;
        const provider = document.getElementById('provider-select').value;
        const groupId = (document.getElementById('sync-group-id')?.value || '').trim();
        
        this.syncService.saveConfig({
            autoSync,
            syncInterval: interval
        });

        if (groupId && typeof this.syncService.setGroupId === 'function') {
            try { this.syncService.setGroupId(groupId); } catch {}
        }
        
        this.syncService.setProvider(provider);
        
        // Guardar configuración específica del proveedor
        let providerConfig = {};
        
        switch (provider) {
            case 'google_sheets':
                providerConfig = {
                    sheetId: document.getElementById('gs-sheet-id').value,
                    apiKey: document.getElementById('gs-api-key').value
                };
                break;
                
            case 'supabase':
                const sbKey = document.getElementById('sb-key').value;
                if (isLikelyJwt(sbKey)) {
                    const payload = decodeJwtPayload(sbKey);
                    const role = payload?.role;
                    if (role === 'service_role') {
                        this.syncService.showNotification(
                            '⚠️ NO uses service_role en el navegador. Usa la anon/public key (Project Settings → API).',
                            'error'
                        );
                        return;
                    }
                }
                providerConfig = {
                    url: document.getElementById('sb-url').value,
                    key: sbKey,
                    table: (document.getElementById('sb-table')?.value || 'ms_constructora_state').trim() || 'ms_constructora_state'
                };
                break;
                
            case 'firestore':
                providerConfig = {
                    projectId: document.getElementById('fs-project-id').value,
                    apiKey: document.getElementById('fs-api-key').value
                };
                break;
                
            case 'rest':
                providerConfig = {
                    endpoint: document.getElementById('rest-endpoint').value,
                    apiKey: document.getElementById('rest-api-key').value
                };
                break;
        }
        
        this.syncService.saveProviderConfig(provider, providerConfig);
        
        this.syncService.showNotification('Configuración guardada', 'success');
        document.querySelector('.modal-overlay')?.remove();
    }
}

// Inicializar UI de sincronización
document.addEventListener('DOMContentLoaded', () => {
    new SyncUI();
});