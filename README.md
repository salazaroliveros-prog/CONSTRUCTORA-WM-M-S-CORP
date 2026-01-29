# CONSTRUCTORA-WM-M-S-CORP

## CONSTRUCTORA WM/M&S — App Web (Multi-página)

Aplicación web estática para gestión de construcción:
- **Dashboard / Inicio**
- **Proyectos**
- **Presupuestos**
- **Compras**
- **Seguimiento**
- **RRHH** (contratación, asistencia con GPS, planilla, vacaciones, ubicación en mapa)

> Proyecto pensado para ejecutarse como sitio estático (HTML/CSS/JS) y desplegarse fácilmente en **GitHub Pages**.

---

## Estructura del proyecto

Archivos principales:
- `index.html`, `inicio.html`, `dashboard.html`, `proyectos.html`, `presupuestos.html`, `compras.html`, `seguimiento.html`, `rrhh.html`, `rendimiento.html`
- `styles.css`, `rrhh.css`
- `app.js` (utilidades, navegación, helpers compartidos)
- `database.js` (**AdvancedDB**: capa de almacenamiento compartida)
- `sync.js` (sincronización)
- `pwa.js`, `manifest.json`, `sw.js` (PWA/offline)

---

## Ejecutar en local (recomendado)

Algunas funciones (por ejemplo **Google Maps** y a veces **Geolocalización**) no funcionan bien abriendo el archivo con `file://`.

### Opción 1: Doble click (Windows)
1. Ejecuta `serve.bat`
2. Se abrirá el navegador en `http://localhost:5500/` (o la página configurada)

**Opcional:** puedes pasar parámetros:
- `serve.bat 5500 rrhh.html`

### Opción 2: PowerShell
En una terminal PowerShell en esta carpeta:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\serve.ps1 -Port 5500 -Page rrhh.html
```

---

## Google Maps (RRHH)

La sección **Ubicación en Tiempo Real** usa la **Google Maps JavaScript API**.

### Configurar la API Key (sin subirla al repo)
En `rrhh.html` hay un botón:
- **“Configurar API Key”**

Esa key se guarda **en tu navegador** (localStorage), no se escribe en el código.

### Requisitos en Google Cloud
En tu proyecto de Google Cloud:
- Habilita **Maps JavaScript API**
- Configura facturación (Google lo requiere)
- Ajusta restricciones de la key:
  - Para local: `http://localhost:*/*`
  - Para GitHub Pages: `https://<TU_USUARIO>.github.io/*`

Si la key está mal, el sistema mostrará un overlay y sugerirá reconfigurarla.

> Recomendación: **no** subas la API key al repositorio.

---

## PWA / Offline

El proyecto incluye:
- `manifest.json`
- Registro de Service Worker en `pwa.js`
- Cache shell en `sw.js`

Esto permite instalación como app y cache básico de recursos.

### Qué funciona offline
- La interfaz (HTML/CSS/JS) queda en **cache** después de la primera carga.
- Los datos se guardan **localmente** en el navegador (localStorage vía `database.js` / AdvancedDB).

> Importante: para que el cache se instale bien, ejecuta la app desde `http://localhost` (con `serve.bat`) al menos una vez.

---

## Sincronización entre PC y móvil (cuando haya internet)

Offline + guardado local funciona sin internet. Pero **sincronizar entre dispositivos** requiere un lugar común en internet (un “backend”).

La app incluye un modo recomendado para uso personal: **Supabase** (gratuito en plan básico).

### Opción recomendada: Supabase
1. Crea un proyecto en Supabase
2. Crea una tabla (SQL Editor) llamada `ms_constructora_state`:
```sql
create table if not exists public.ms_constructora_state (
  group_id text primary key,
  device_id text,
  updated_at timestamptz not null default now(),
  payload jsonb not null
);
```

3. Activa RLS y crea una policy simple (solo si quieres asegurar acceso). Para uso personal puedes mantenerlo simple.

4. En la app, abre **Configurar** en la barra flotante de sincronización y configura el proveedor **Supabase**:
  - `url`: `https://TU-PROYECTO.supabase.co`
  - `key`: tu `anon public key`
  - `table` (opcional): `ms_constructora_state`
  - `group id`: el mismo en tu PC y tu móvil (ej: `wmms`)

5. En ambos dispositivos:
  - Abre la app
  - Presiona **Sincronizar**
  - Cuando vuelvan a tener internet, la app hace merge por `updatedAt` y también replica eliminaciones (tombstones).

> Nota de seguridad: la `anon key` se guarda en el navegador del dispositivo (localStorage). Para “solo uso personal” está bien, pero evita compartirla.

---

## Despliegue en GitHub Pages

### 1) Inicializar git (si aún no existe)
En una terminal en esta carpeta:
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2) Crear el repo en GitHub
Crea un repositorio nuevo (por ejemplo `corporacion-mys-app`).

### 3) Conectar y subir
```bash
git branch -M main
git remote add origin https://github.com/<TU_USUARIO>/<TU_REPO>.git
git push -u origin main
```

### 4) Activar Pages
En GitHub:
- **Settings → Pages**
- **Build and deployment**: *Deploy from a branch*
- Branch: `main` / Folder: `/ (root)`

La URL final será similar a:
- `https://<TU_USUARIO>.github.io/<TU_REPO>/`

---

## Notas

- **Base de datos / datos:** el proyecto usa `database.js` como capa principal (AdvancedDB) para evitar que cada página tenga datos diferentes.
- Si estás probando y quieres “empezar limpio”, puedes borrar el almacenamiento del sitio:
  - DevTools → Application/Storage → **Local Storage** → Clear

---

## Licencia

Ver [LICENSE](LICENSE) (uso interno / privado).
