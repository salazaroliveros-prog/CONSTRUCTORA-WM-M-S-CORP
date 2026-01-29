// ===== SISTEMA DE BASE DE DATOS AVANZADO =====
// Gestión de datos local con esquemas y validaciones

class AdvancedDatabase {
    constructor() {
        this.prefix = 'ms_constructora_';
        this.schemas = this.defineSchemas();
        this.init();
    }

    // ===== DEFINICIÓN DE ESQUEMAS =====
    defineSchemas() {
        const schemas = {
            proyectos: {
                fields: {
                    codigo: { type: 'string', required: true, unique: true },
                    nombre: { type: 'string', required: true },
                    cliente: { type: 'string', required: true },
                    ubicacion: { type: 'string', required: true },
                    tipologia: { type: 'string', enum: ['RESIDENCIAL', 'COMERCIAL', 'INDUSTRIAL', 'CIVIL', 'PUBLICA'] },
                    areaTerreno: { type: 'number' },
                    areaConstruccion: { type: 'number' },
                    estado: { type: 'string', enum: ['espera', 'activo', 'completado', 'cancelado'], default: 'espera' },
                    fechaInicio: { type: 'date' },
                    fechaFinEstimada: { type: 'date' },
                    presupuestoAprobado: { type: 'number', min: 0 },
                    avanceFisico: { type: 'number', min: 0, max: 100, default: 0 },
                    avanceFinanciero: { type: 'number', min: 0, max: 100, default: 0 },
                    descripcion: { type: 'string' },
                    necesidades: { type: 'string' },
                    supervisorId: { type: 'string' },
                    createdAt: { type: 'datetime', default: () => new Date().toISOString() },
                    updatedAt: { type: 'datetime', default: () => new Date().toISOString() }
                },
                indexes: ['codigo', 'cliente', 'estado', 'tipologia']
            },

            transacciones: {
                fields: {
                    proyectoId: { type: 'string', required: true },
                    tipo: { type: 'string', enum: ['ingreso', 'gasto'], required: true },
                    descripcion: { type: 'string', required: true },
                    monto: { type: 'number', required: true, min: 0 },
                    moneda: { type: 'string', default: 'GTQ' },
                    unidad: { type: 'string' },
                    cantidad: { type: 'number' },
                    categoria: { type: 'string', required: true },
                    subcategoria: { type: 'string' },
                    proveedorId: { type: 'string' },
                    fecha: { type: 'date', required: true },
                    mes: { type: 'string' },
                    documento: { type: 'string' },
                    observaciones: { type: 'string' },
                    estado: { type: 'string', enum: ['pendiente', 'completado', 'cancelado'], default: 'completado' },
                    syncStatus: { type: 'string', enum: ['pending', 'synced', 'error'], default: 'pending' },
                    createdAt: { type: 'datetime', default: () => new Date().toISOString() }
                },
                indexes: ['proyectoId', 'tipo', 'fecha', 'categoria', 'estado']
            },

            presupuestos: {
                fields: {
                    proyectoId: { type: 'string', required: true },
                    version: { type: 'string', required: true },
                    tipologia: { type: 'string', required: true },
                    tipoCubierta: { type: 'string' },
                    items: { type: 'array', default: [] },
                    costoDirecto: { type: 'number', min: 0 },
                    costoIndirecto: { type: 'number', min: 0 },
                    impuestos: { type: 'number', min: 0 },
                    utilidad: { type: 'number', min: 0 },
                    total: { type: 'number', min: 0 },
                    duracionEstimada: { type: 'number', min: 0 }, // en días
                    estado: { type: 'string', enum: ['borrador', 'aprobado', 'rechazado'], default: 'borrador' },
                    aprobadoPor: { type: 'string' },
                    fechaAprobacion: { type: 'date' },
                    createdAt: { type: 'datetime', default: () => new Date().toISOString() },
                    updatedAt: { type: 'datetime', default: () => new Date().toISOString() }
                },
                indexes: ['proyectoId', 'estado', 'tipologia']
            },

            // Items individuales (renglones) dentro de un presupuesto
            // Nota: usado por `presupuestos.html` para cargar/guardar por proyecto.
            presupuestos_items: {
                fields: {
                    presupuestoId: { type: 'string', required: true },
                    proyectoId: { type: 'string', required: true },
                    codigo: { type: 'string', required: true },
                    descripcion: { type: 'string', required: true },
                    unidad: { type: 'string', required: true },
                    cantidad: { type: 'number', min: 0, default: 0 },
                    precioUnitario: { type: 'number', min: 0, default: 0 },
                    subtotal: { type: 'number', min: 0, default: 0 },
                    categoria: { type: 'string' },
                    especificaciones: { type: 'string' },
                    rendimiento: { type: 'number', min: 0 },
                    materiales: { type: 'array', default: [] },
                    tipologia: { type: 'string' },
                    tipoCubierta: { type: 'string' },
                    desglose: { type: 'object' },
                    syncStatus: { type: 'string', enum: ['pending', 'synced', 'error'], default: 'pending' },
                    createdAt: { type: 'datetime', default: () => new Date().toISOString() },
                    updatedAt: { type: 'datetime', default: () => new Date().toISOString() }
                },
                indexes: ['presupuestoId', 'proyectoId', 'categoria', 'codigo']
            },

            materiales: {
                fields: {
                    codigo: { type: 'string', required: true, unique: true },
                    nombre: { type: 'string', required: true },
                    descripcion: { type: 'string' },
                    unidad: { type: 'string', required: true },
                    categoria: { type: 'string', required: true },
                    subcategoria: { type: 'string' },
                    precioUnitario: { type: 'number', min: 0 },
                    precioActualizado: { type: 'date' },
                    proveedorPrincipalId: { type: 'string' },
                    stockMinimo: { type: 'number', min: 0 },
                    stockActual: { type: 'number', min: 0, default: 0 },
                    ubicacionAlmacen: { type: 'string' },
                    especificaciones: { type: 'string' },
                    estado: { type: 'string', enum: ['activo', 'inactivo', 'descontinuado'], default: 'activo' },
                    createdAt: { type: 'datetime', default: () => new Date().toISOString() }
                },
                indexes: ['codigo', 'categoria', 'estado']
            },

            trabajadores: {
                fields: {
                    codigo: { type: 'string', required: true, unique: true },
                    nombre: { type: 'string', required: true },
                    apellido: { type: 'string', required: true },
                    dpi: { type: 'string', required: true, unique: true },
                    telefono: { type: 'string', required: true },
                    email: { type: 'string' },
                    direccion: { type: 'string' },
                    puesto: { type: 'string', required: true },
                    salarioDiario: { type: 'number', required: true, min: 0 },
                    fechaContratacion: { type: 'date', required: true },
                    proyectoAsignado: { type: 'string' },
                    estado: { type: 'string', enum: ['activo', 'inactivo', 'suspendido'], default: 'activo' },
                    habilidades: { type: 'array', default: [] },
                    experiencia: { type: 'number', min: 0 }, // en años
                    referencias: { type: 'array', default: [] },
                    fotoUrl: { type: 'string' },
                    firmaDigital: { type: 'string' },
                    createdAt: { type: 'datetime', default: () => new Date().toISOString() },
                    updatedAt: { type: 'datetime', default: () => new Date().toISOString() }
                },
                indexes: ['codigo', 'dpi', 'puesto', 'estado', 'proyectoAsignado']
            },

            asistencias: {
                fields: {
                    trabajadorId: { type: 'string', required: true },
                    proyectoId: { type: 'string', required: true },
                    fecha: { type: 'date', required: true },
                    horaEntrada: { type: 'datetime' },
                    horaSalida: { type: 'datetime' },
                    horasTrabajadas: { type: 'number', min: 0 },
                    horasExtra: { type: 'number', min: 0, default: 0 },
                    ubicacionEntrada: { type: 'object' },
                    ubicacionSalida: { type: 'object' },

                    estado: { type: 'string', enum: ['presente', 'ausente', 'tardanza', 'permiso'], default: 'presente' },
                    observaciones: { type: 'string' },
                    pagoCalculado: { type: 'number', min: 0 },
                    syncStatus: { type: 'string', enum: ['pending', 'synced', 'error'], default: 'pending' },
                    createdAt: { type: 'datetime', default: () => new Date().toISOString() }
                },
                indexes: ['trabajadorId', 'proyectoId', 'fecha', 'estado']
            },

            rendimientos: {
                fields: {
                    proyectoId: { type: 'string' },
                    fecha: { type: 'datetime', required: true },
                    equipo: { type: 'string', required: true },
                    renglon: { type: 'string', required: true },
                    cantidad: { type: 'number', required: true, min: 0 },
                    horas: { type: 'number', required: true, min: 0 },
                    trabajadores: { type: 'number', required: true, min: 1 },
                    rendimientoDiario: { type: 'number', min: 0 },
                    porcentajeVsEstandar: { type: 'number', min: 0 },
                    productividad: { type: 'number', min: 0 },
                    eficienciaCosto: { type: 'number', min: 0 },
                    estado: { type: 'string' },
                    observaciones: { type: 'string' },
                    createdAt: { type: 'datetime', default: () => new Date().toISOString() },
                    updatedAt: { type: 'datetime', default: () => new Date().toISOString() }
                },
                indexes: ['proyectoId', 'fecha', 'equipo', 'renglon', 'estado']
            },

            compras: {
                fields: {
                    numeroOrden: { type: 'string', required: true, unique: true },
                    proyectoId: { type: 'string', required: true },
                    proveedorId: { type: 'string', required: true },
                    fechaSolicitud: { type: 'date', required: true },
                    fechaEntregaEstimada: { type: 'date' },
                    fechaEntregaReal: { type: 'date' },
                    items: { type: 'array', required: true },
                    subtotal: { type: 'number', min: 0 },
                    iva: { type: 'number', min: 0 },
                    total: { type: 'number', min: 0 },
                    estado: { type: 'string', enum: ['solicitado', 'aprobado', 'en_proceso', 'entregado', 'cancelado'], default: 'solicitado' },
                    metodoPago: { type: 'string' },
                    facturaNumero: { type: 'string' },
                    observaciones: { type: 'string' },
                    creadoPor: { type: 'string' },
                    aprobadoPor: { type: 'string' },
                    fechaAprobacion: { type: 'date' },
                    createdAt: { type: 'datetime', default: () => new Date().toISOString() },
                    updatedAt: { type: 'datetime', default: () => new Date().toISOString() }
                },
                indexes: ['numeroOrden', 'proyectoId', 'proveedorId', 'estado', 'fechaSolicitud']
            },

            proveedores: {
                fields: {
                    codigo: { type: 'string', required: true, unique: true },
                    nombre: { type: 'string', required: true },
                    tipo: { type: 'string', enum: ['materiales', 'equipos', 'servicios', 'subcontrato'], required: true },
                    contacto: { type: 'string', required: true },
                    telefono: { type: 'string', required: true },
                    email: { type: 'string' },
                    direccion: { type: 'string' },
                    nit: { type: 'string' },
                    productos: { type: 'array', default: [] },
                    rating: { type: 'number', min: 0, max: 5 },
                    plazoEntrega: { type: 'number', min: 0 }, // en días
                    condicionesPago: { type: 'string' },
                    estado: { type: 'string', enum: ['activo', 'inactivo', 'suspendido'], default: 'activo' },
                    createdAt: { type: 'datetime', default: () => new Date().toISOString() },
                    updatedAt: { type: 'datetime', default: () => new Date().toISOString() }
                },
                indexes: ['codigo', 'tipo', 'estado']
            },

            alertas: {
                fields: {
                    tipo: { type: 'string', required: true },
                    proyectoId: { type: 'string' },
                    prioridad: { type: 'string', enum: ['baja', 'media', 'alta', 'critica'], default: 'media' },
                    mensaje: { type: 'string', required: true },
                    fechaVencimiento: { type: 'datetime' },
                    fechaRecordatorio: { type: 'datetime' },
                    estado: { type: 'string', enum: ['pendiente', 'vista', 'completada', 'vencida'], default: 'pendiente' },
                    accionRequerida: { type: 'string' },
                    asignadoA: { type: 'string' },
                    createdAt: { type: 'datetime', default: () => new Date().toISOString() }
                },
                indexes: ['tipo', 'estado', 'prioridad', 'fechaVencimiento']
            }
        };

        Object.keys(schemas).forEach((name) => {
            schemas[name].name = name;
        });

        return schemas;
    }

    // ===== INICIALIZACIÓN =====
    init() {
        console.log('Inicializando base de datos avanzada...');
        
        // Crear colecciones si no existen
        Object.keys(this.schemas).forEach(collection => {
            if (!this.get(collection)) {
                this.set(collection, []);
                console.log(`Colección ${collection} inicializada`);
            }
        });

        // Iniciar limpieza automática
        this.startAutoCleanup();
    }

    // ===== MÉTODOS CRUD CON VALIDACIÓN =====
    insert(collection, data) {
        const schema = this.schemas[collection];
        if (!schema) {
            throw new Error(`Colección ${collection} no definida en esquema`);
        }

        // Validar datos
        const validatedData = this.validateData(schema, data);
        
        // Generar ID único
        const id = this.generateId();
        const now = new Date().toISOString();
        
        const item = {
            id,
            ...validatedData,
            createdAt: now,
            updatedAt: now,
            status: 'active'
        };

        // Insertar en colección
        const items = this.get(collection) || [];
        items.push(item);
        this.set(collection, items);

        // Emitir evento
        this.emitEvent('insert', { collection, item });

        return item;
    }

    update(collection, id, data) {
        const schema = this.schemas[collection];
        if (!schema) {
            throw new Error(`Colección ${collection} no definida en esquema`);
        }

        const items = this.get(collection) || [];
        const index = items.findIndex(item => item.id === id);
        
        if (index === -1) {
            throw new Error(`Elemento con id ${id} no encontrado en ${collection}`);
        }

        // Validar datos parcialmente (solo los campos proporcionados)
        const validatedData = this.validatePartialData(schema, data);
        
        // Actualizar item
        items[index] = {
            ...items[index],
            ...validatedData,
            updatedAt: new Date().toISOString()
        };

        this.set(collection, items);

        // Emitir evento
        this.emitEvent('update', { collection, id, data: validatedData });

        return items[index];
    }

    delete(collection, id) {
        const items = this.get(collection) || [];
        const filteredItems = items.filter(item => item.id !== id);
        
        if (filteredItems.length === items.length) {
            throw new Error(`Elemento con id ${id} no encontrado en ${collection}`);
        }

        this.set(collection, filteredItems);

        // Emitir evento
        this.emitEvent('delete', { collection, id });

        return true;
    }

    // ===== VALIDACIÓN DE DATOS =====
    validateData(schema, data) {
        const validated = {};
        const errors = [];

        // Validar cada campo del esquema
        Object.keys(schema.fields).forEach(field => {
            const fieldSchema = schema.fields[field];
            const value = data[field];
            
            // Verificar campos requeridos
            if (fieldSchema.required && (value === undefined || value === null || value === '')) {
                errors.push(`Campo ${field} es requerido`);
                return;
            }

            // Si no hay valor y hay valor por defecto
            if (value === undefined && fieldSchema.default !== undefined) {
                validated[field] = typeof fieldSchema.default === 'function' 
                    ? fieldSchema.default() 
                    : fieldSchema.default;
                return;
            }

            // Si hay valor, validar tipo y restricciones
            if (value !== undefined && value !== null) {
                // Validar tipo
                if (!this.validateType(value, fieldSchema.type)) {
                    errors.push(`Campo ${field} debe ser de tipo ${fieldSchema.type}`);
                    return;
                }

                // Validar enumeración
                if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
                    errors.push(`Campo ${field} debe ser uno de: ${fieldSchema.enum.join(', ')}`);
                    return;
                }

                // Validar mínimo
                if (fieldSchema.min !== undefined && value < fieldSchema.min) {
                    errors.push(`Campo ${field} debe ser mayor o igual a ${fieldSchema.min}`);
                    return;
                }

                // Validar máximo
                if (fieldSchema.max !== undefined && value > fieldSchema.max) {
                    errors.push(`Campo ${field} debe ser menor o igual a ${fieldSchema.max}`);
                    return;
                }

                // Validar unicidad
                if (fieldSchema.unique) {
                    const items = this.get(schema.name);
                    if (items && items.some(item => item[field] === value && item.id !== data.id)) {
                        errors.push(`El valor ${value} para ${field} ya existe`);
                        return;
                    }
                }

                validated[field] = value;
            }
        });

        // Verificar campos adicionales no definidos en esquema
        Object.keys(data).forEach(field => {
            if (!schema.fields[field] && !['id', 'createdAt', 'updatedAt', 'status'].includes(field)) {
                console.warn(`Campo ${field} no está definido en el esquema de ${schema.name}`);
                validated[field] = data[field];
            }
        });

        if (errors.length > 0) {
            throw new Error(`Errores de validación: ${errors.join('; ')}`);
        }

        return validated;
    }

    validatePartialData(schema, data) {
        const validated = {};
        const errors = [];

        Object.keys(data).forEach(field => {
            if (schema.fields[field]) {
                const fieldSchema = schema.fields[field];
                const value = data[field];

                // Validar tipo
                if (!this.validateType(value, fieldSchema.type)) {
                    errors.push(`Campo ${field} debe ser de tipo ${fieldSchema.type}`);
                    return;
                }

                // Validar enumeración
                if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
                    errors.push(`Campo ${field} debe ser uno de: ${fieldSchema.enum.join(', ')}`);
                    return;
                }

                // Validar mínimo
                if (fieldSchema.min !== undefined && value < fieldSchema.min) {
                    errors.push(`Campo ${field} debe ser mayor o igual a ${fieldSchema.min}`);
                    return;
                }

                // Validar máximo
                if (fieldSchema.max !== undefined && value > fieldSchema.max) {
                    errors.push(`Campo ${field} debe ser menor o igual a ${fieldSchema.max}`);
                    return;
                }

                // Validar unicidad
                if (fieldSchema.unique && value !== undefined) {
                    const items = this.get(schema.name);
                    const currentItem = items.find(item => item.id === data.id);
                    if (items && items.some(item => item[field] === value && item.id !== (data.id || currentItem?.id))) {
                        errors.push(`El valor ${value} para ${field} ya existe`);
                        return;
                    }
                }

                validated[field] = value;
            } else if (!['id', 'createdAt', 'updatedAt', 'status'].includes(field)) {
                console.warn(`Campo ${field} no está definido en el esquema de ${schema.name}`);
                validated[field] = data[field];
            }
        });

        if (errors.length > 0) {
            throw new Error(`Errores de validación: ${errors.join('; ')}`);
        }

        return validated;
    }

    validateType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'date':
                return !isNaN(Date.parse(value));
            case 'datetime':
                return !isNaN(Date.parse(value));
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && !Array.isArray(value) && value !== null;
            default:
                return true;
        }
    }

    // ===== CONSULTAS AVANZADAS =====
    find(collection, query = {}, options = {}) {
        let items = this.get(collection) || [];
        
        // Aplicar filtros
        if (Object.keys(query).length > 0) {
            items = items.filter(item => {
                return Object.keys(query).every(key => {
                    const queryValue = query[key];
                    const itemValue = item[key];
                    
                    if (queryValue === null || queryValue === undefined) {
                        return itemValue === queryValue;
                    }
                    
                    if (typeof queryValue === 'object') {
                        // Consultas avanzadas
                        if (queryValue.$eq !== undefined) return itemValue === queryValue.$eq;
                        if (queryValue.$ne !== undefined) return itemValue !== queryValue.$ne;
                        if (queryValue.$gt !== undefined) return itemValue > queryValue.$gt;
                        if (queryValue.$gte !== undefined) return itemValue >= queryValue.$gte;
                        if (queryValue.$lt !== undefined) return itemValue < queryValue.$lt;
                        if (queryValue.$lte !== undefined) return itemValue <= queryValue.$lte;
                        if (queryValue.$in !== undefined) return queryValue.$in.includes(itemValue);
                        if (queryValue.$nin !== undefined) return !queryValue.$nin.includes(itemValue);
                        if (queryValue.$like !== undefined) {
                            const pattern = queryValue.$like.replace(/%/g, '.*');
                            const regex = new RegExp(`^${pattern}$`, 'i');
                            return regex.test(String(itemValue));
                        }
                    }
                    
                    return String(itemValue).toLowerCase().includes(String(queryValue).toLowerCase());
                });
            });
        }
        
        // Ordenar
        if (options.sort) {
            items.sort((a, b) => {
                for (const [field, direction] of Object.entries(options.sort)) {
                    const aValue = a[field];
                    const bValue = b[field];
                    
                    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        
        // Paginación
        if (options.skip || options.limit) {
            const skip = options.skip || 0;
            const limit = options.limit || items.length;
            items = items.slice(skip, skip + limit);
        }
        
        return items;
    }

    findOne(collection, query = {}) {
        const items = this.find(collection, query, { limit: 1 });
        return items.length > 0 ? items[0] : null;
    }

    count(collection, query = {}) {
        return this.find(collection, query).length;
    }

    aggregate(collection, pipeline = []) {
        let items = this.get(collection) || [];
        
        pipeline.forEach(stage => {
            if (stage.$match) {
                items = items.filter(item => {
                    return Object.keys(stage.$match).every(key => {
                        const condition = stage.$match[key];
                        const value = item[key];
                        
                        if (typeof condition === 'object') {
                            if (condition.$eq !== undefined) return value === condition.$eq;
                            if (condition.$gt !== undefined) return value > condition.$gt;
                            if (condition.$gte !== undefined) return value >= condition.$gte;
                            if (condition.$lt !== undefined) return value < condition.$lt;
                            if (condition.$lte !== undefined) return value <= condition.$lte;
                        }
                        
                        return value === condition;
                    });
                });
            }
            
            if (stage.$group) {
                const grouped = {};
                const groupId = stage.$group._id;
                
                items.forEach(item => {
                    const groupKey = groupId ? item[groupId] : 'all';
                    
                    if (!grouped[groupKey]) {
                        grouped[groupKey] = {
                            _id: groupKey,
                            count: 0,
                            items: []
                        };
                        
                        // Inicializar acumuladores
                        Object.keys(stage.$group).forEach(field => {
                            if (field !== '_id') {
                                const accumulator = stage.$group[field];
                                if (accumulator.$sum === 1) {
                                    grouped[groupKey][field] = 0;
                                } else if (accumulator.$sum) {
                                    grouped[groupKey][field] = 0;
                                } else if (accumulator.$avg) {
                                    grouped[groupKey][field] = { sum: 0, count: 0 };
                                }
                            }
                        });
                    }
                    
                    grouped[groupKey].count++;
                    grouped[groupKey].items.push(item);
                    
                    // Acumular valores
                    Object.keys(stage.$group).forEach(field => {
                        if (field !== '_id') {
                            const accumulator = stage.$group[field];
                            const fieldValue = item[field.split('.')[1]] || 0;
                            
                            if (accumulator.$sum === 1) {
                                grouped[groupKey][field]++;
                            } else if (accumulator.$sum) {
                                grouped[groupKey][field] += fieldValue;
                            } else if (accumulator.$avg) {
                                grouped[groupKey][field].sum += fieldValue;
                                grouped[groupKey][field].count++;
                            }
                        }
                    });
                });
                
                // Procesar acumuladores finales
                items = Object.values(grouped).map(group => {
                    Object.keys(stage.$group).forEach(field => {
                        if (field !== '_id') {
                            const accumulator = stage.$group[field];
                            
                            if (accumulator.$avg) {
                                group[field] = group[field].count > 0 
                                    ? group[field].sum / group[field].count 
                                    : 0;
                            }
                        }
                    });
                    
                    delete group.items;
                    return group;
                });
            }
            
            if (stage.$sort) {
                items.sort((a, b) => {
                    for (const [field, direction] of Object.entries(stage.$sort)) {
                        const aValue = a[field];
                        const bValue = b[field];
                        
                        if (aValue < bValue) return direction === 1 ? -1 : 1;
                        if (aValue > bValue) return direction === 1 ? 1 : -1;
                    }
                    return 0;
                });
            }
            
            if (stage.$limit) {
                items = items.slice(0, stage.$limit);
            }
        });
        
        return items;
    }

    // ===== MÉTODOS DE UTILIDAD =====
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    get(collection) {
        const data = localStorage.getItem(this.prefix + collection);
        return data ? JSON.parse(data) : null;
    }

    set(collection, data) {
        localStorage.setItem(this.prefix + collection, JSON.stringify(data));
        this.emitEvent('change', { collection, data });
        return true;
    }

    clear(collection) {
        localStorage.removeItem(this.prefix + collection);
        this.emitEvent('clear', { collection });
    }

    clearAll() {
        Object.keys(this.schemas).forEach(collection => {
            localStorage.removeItem(this.prefix + collection);
        });
        this.emitEvent('clearAll', {});
    }

    backup() {
        const backup = {};
        Object.keys(this.schemas).forEach(collection => {
            backup[collection] = this.get(collection);
        });
        
        const backupStr = JSON.stringify(backup);
        const blob = new Blob([backupStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_mns_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        return backup;
    }

    restore(backupData) {
        if (typeof backupData === 'string') {
            backupData = JSON.parse(backupData);
        }
        
        Object.keys(backupData).forEach(collection => {
            if (this.schemas[collection]) {
                this.set(collection, backupData[collection]);
            }
        });
        
        this.emitEvent('restore', { backupData });
    }

    // ===== MÉTODOS DE MANTENIMIENTO =====
    startAutoCleanup() {
        // Limpiar datos antiguos cada 24 horas
        setInterval(() => {
            this.cleanupOldData();
        }, 24 * 60 * 60 * 1000);
    }

    cleanupOldData() {
        const now = new Date();
        const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
        
        Object.keys(this.schemas).forEach(collection => {
            const items = this.get(collection) || [];
            const filteredItems = items.filter(item => {
                const updatedAt = new Date(item.updatedAt || item.createdAt);
                return updatedAt > sixMonthsAgo || item.status === 'active';
            });
            
            if (filteredItems.length < items.length) {
                this.set(collection, filteredItems);
                console.log(`Limpieza en ${collection}: ${items.length - filteredItems.length} elementos eliminados`);
            }
        });
    }

    getDatabaseSize() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                total += localStorage.getItem(key).length * 2; // UTF-16
            }
        }
        return total;
    }

    getCollectionStats() {
        const stats = {};
        Object.keys(this.schemas).forEach(collection => {
            const items = this.get(collection) || [];
            stats[collection] = {
                count: items.length,
                lastUpdated: items.length > 0 
                    ? new Date(Math.max(...items.map(i => new Date(i.updatedAt || i.createdAt).getTime())))
                    : null,
                size: JSON.stringify(items).length * 2
            };
        });
        return stats;
    }

    // ===== EVENTOS =====
    emitEvent(event, data) {
        const eventName = `db:${event}`;
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    on(event, callback) {
        window.addEventListener(`db:${event}`, (e) => callback(e.detail));
    }

    off(event, callback) {
        window.removeEventListener(`db:${event}`, (e) => callback(e.detail));
    }
}

// ===== INSTANCIA GLOBAL =====
const AdvancedDB = new AdvancedDatabase();

// Exportar para uso global
window.AdvancedDB = AdvancedDB;