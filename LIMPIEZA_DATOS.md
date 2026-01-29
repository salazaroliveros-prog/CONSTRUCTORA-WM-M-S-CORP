# Guía de Limpieza de Datos - M&S Constructora

## ⚠️ IMPORTANTE: Aplicación Lista Para Producción

La aplicación ha sido limpiada de todos los datos de prueba y está lista para ser utilizada con datos reales.

## ✅ Cambios Realizados

### 1. Base de Datos (database.js)
- ✅ Eliminado el método `loadSampleData()` completo
- ✅ Removida la llamada automática a `loadSampleData()` en el método `init()`
- ✅ La base de datos ahora inicia completamente vacía

### 2. Recursos Humanos (rrhh.html)
- ✅ Eliminados los 3 aplicantes de prueba:
  - Juan Pérez López (Supervisor)
  - María González (Maestro de Obras)
  - Carlos Ramírez (Ayudante)
- ✅ Eliminados proyectos hardcodeados en el selector de asistencia
- ✅ Ahora muestra mensaje cuando no hay aplicantes

### 3. Otros Archivos
- ✅ app.js - Verificado, no contiene datos de prueba
- ✅ proyectos.html - Solo inicializa arrays vacíos
- ✅ presupuestos.html - Solo inicializa arrays vacíos
- ✅ dashboard.html - Obtiene datos de la base de datos
- ✅ inicio.html - Solo inicializa arrays vacíos

## 🧹 Herramienta de Limpieza

Se ha creado un archivo `limpiar-datos.html` que permite:
- Eliminar TODOS los datos almacenados en localStorage
- Limpiar cualquier dato residual de pruebas anteriores
- Reiniciar la aplicación con una base de datos completamente vacía

### Cómo usar la herramienta de limpieza:

1. Abrir el archivo `limpiar-datos.html` en el navegador
2. Leer las advertencias cuidadosamente
3. Hacer clic en "Limpiar Todos los Datos"
4. Confirmar la acción
5. Los datos se eliminarán permanentemente

## 📋 Colecciones Que Inician Vacías

Todas las siguientes colecciones inician vacías y listas para recibir datos reales:

- ✅ **proyectos** - Sin proyectos de ejemplo
- ✅ **transacciones** - Sin transacciones de ejemplo
- ✅ **presupuestos** - Sin presupuestos de ejemplo
- ✅ **presupuestos_items** - Sin items de presupuesto
- ✅ **materiales** - Sin materiales de ejemplo
- ✅ **proveedores** - Sin proveedores de ejemplo
- ✅ **trabajadores** - Sin trabajadores de ejemplo
- ✅ **asistencias** - Sin asistencias de ejemplo
- ✅ **compras** - Sin compras de ejemplo
- ✅ **alertas** - Sin alertas de ejemplo
- ✅ **rendimientos** - Sin rendimientos de ejemplo

## 🚀 Primeros Pasos con la Aplicación Limpia

### 1. Limpiar datos anteriores
```
1. Abrir limpiar-datos.html
2. Hacer clic en "Limpiar Todos los Datos"
3. Confirmar la acción
```

### 2. Iniciar la aplicación
```
1. Abrir index.html
2. La aplicación iniciará con la base de datos vacía
3. Todas las colecciones se crearán automáticamente vacías
```

### 3. Agregar sus primeros datos reales
```
- Crear su primer proyecto en proyectos.html
- Agregar proveedores reales en compras.html
- Registrar trabajadores reales en rrhh.html
- Crear presupuestos para sus proyectos
- Registrar transacciones reales
```

## 🔄 Sincronización con Supabase

Para conectar la aplicación con Supabase y usar datos reales:

1. Ir a la página de sincronización (sync.html)
2. Configurar las credenciales de Supabase
3. La aplicación sincronizará automáticamente con la base de datos en la nube

## ⚠️ Advertencias

- **NO** existe un método `loadSampleData()` - fue eliminado completamente
- **NO** se cargarán datos de prueba automáticamente
- **TODOS** los datos deberán ser ingresados manualmente o importados desde Supabase
- La herramienta de limpieza elimina datos **permanentemente** sin posibilidad de recuperación

## 📝 Notas Adicionales

- Los esquemas de las colecciones siguen funcionando con validación completa
- Todas las funcionalidades de CRUD están operativas
- La sincronización con servicios cloud está lista para configurarse
- El sistema de alertas, notificaciones y reportes funciona normalmente
- La aplicación está lista para uso en producción con clientes reales

## ✅ Lista de Verificación Final

- [x] Método loadSampleData() eliminado
- [x] Llamada a loadSampleData() removida
- [x] Aplicantes de prueba eliminados en rrhh.html
- [x] Proyectos hardcodeados eliminados
- [x] Herramienta de limpieza creada
- [x] Documentación actualizada
- [x] Aplicación lista para producción

---

**Fecha de limpieza:** Enero 29, 2026  
**Estado:** ✅ LISTO PARA PRODUCCIÓN  
**Base de datos:** 🗄️ COMPLETAMENTE VACÍA
