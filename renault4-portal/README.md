# Renault 4 · Portal 3D (3D Gaussian Splatting + Off-Axis)

Aplicación web en la que un Renault 4 aparece dentro de una "ventana física". La proyección
óptica se recalcula con la posición real de tu ojo: al moverte, la escena se ve como si
miraras a través de un cristal.

**Stack:** Vite · TypeScript (estricto) · Tailwind CSS v4 · Three.js (WebGL2) ·
`@mkkellogg/gaussian-splats-3d` 0.4.7 · `@mediapipe/tasks-vision` 1.2.2 · Cloudflare Workers / Pages.

## Ejecutar en local

Requisitos: Node 22+ y un navegador con WebGL2. La cámara sólo funciona en `https://` o `localhost`.

```bash
cd renault4-portal
npm install
npm run dev            # http://localhost:5173
```

Build de producción y vista previa (con las cabeceras COOP/COEP):

```bash
npm run build          # tsc --noEmit + vite build
npm run preview        # http://localhost:4173
```

Sin `public/assets/renault4.*` la app muestra el **Modo Demo Procedural**: un Renault 4
aproximado generado en memoria como Gaussian Splats, con garaje y haz volumétrico.

## Controles

| Acción | Cómo |
| --- | --- |
| Entrar al portal | Botón inicial (activa cámara y sensores; requisito de los navegadores) |
| Fuente de tracking | Webcam · Ratón/táctil · Giroscopio (o teclas `1` `2` `3`) |
| Recalibrar vista | Botón o tecla `C`: la postura actual pasa a ser el centro |
| Debug | Botón o tecla `D`: inset con el frustum asimétrico, el cristal, el ojo y el coche |
| Vista cámara | Previsualización pequeña con los 478 landmarks y los iris resaltados |

Por defecto: en móvil con giroscopio se usa **Giroscopio**; si no, **Webcam**. Si una fuente
falla, la app pasa a **Ratón / táctil** y lo indica.

## Arquitectura

```
src/
  config.ts                      parámetros del portal (distancias, escena, tracking)
  core/OffAxisCamera.ts          proyección asimétrica (Kooima) sobre el cristal z = 0
  vision/
    EyeSource.ts                 base: vista neutra, desplazamiento, One Euro
    HeadTracker.ts               MediaPipe FaceLandmarker (GPU→CPU) sobre webcam 640×480
    MobileOrientationTracker.ts  DeviceOrientationEvent (permiso iOS 13+)
    PointerTracker.ts            fallback ratón / táctil
    EyeTrackingRig.ts            conmutación entre fuentes
  utils/OneEuroFilter.ts         filtro One Euro (jitter fuera, latencia baja)
  scene/
    GaussianSceneManager.ts      WebGLRenderer + Viewer de gaussian-splats-3d + carga
    ProceduralRenault4Splat.ts   generador procedural de splats (formato .splat)
    FrustumDebugHelper.ts        inset de depuración
  ui/OverlayHUD.ts               HUD en TypeScript puro + Tailwind
  types/gaussian-splats-3d.d.ts  tipos mínimos (la librería no trae .d.ts)
public/
  _headers                       COOP/COEP/CORP para Cloudflare
  assets/                        aquí va renault4.ksplat (ver abajo)
```

### Proyección off-axis

El cristal está en `z = 0`, con esquinas `pa` (inf-izq), `pb` (inf-der) y `pc` (sup-izq).
Con el ojo `pe = (x, y, z)` en unidades de escena:

- `vr = normalize(pb − pa)`, `vu = normalize(pc − pa)`, `vn = normalize(vr × vu)`
- `va = pa − pe`, `vb = pb − pe`, `vc = pc − pe`, `d = −va·vn`
- `left = (vr·va)·near/d`, `right = (vr·vb)·near/d`, `bottom = (vu·va)·near/d`, `top = (vu·vc)·near/d`
- `projectionMatrix.makePerspective(left, right, top, bottom, near, far)`

La cámara se coloca en `pe` con rotación identidad, de modo que su marco es paralelo al cristal.
El tracking convierte metros a unidades con `widthUnits / widthMeters` (1.6 u ↔ 0.6 m).

**Webcam:** `Z = f · IPD_real / IPD_px`, con `IPD_real = 63 mm` y `f = (W/2)/tan(FOV/2)`.
El centro de los iris (landmarks 468 y 473) se retro-proyecta a esa profundidad.
La imagen no está espejada: si te mueves a tu derecha, la vista se desplaza a la derecha.

## Captura real del Renault 4 (3DGS)

1. **Captura:** rodea el coche a 1–1.5 m de distancia, a altura de pecho y después desde arriba.
   Usa luz difusa (sin sol directo ni reflejos), fondo estable y 150–400 fotos o un vídeo
   lento y continuo. Evita mover el coche entre tomas.
2. **Entrenamiento y exportación:** procesa la captura con **Luma AI**, **Polycam** o
   **Postshot** y exporta un archivo **`.ply`** de Gaussian Splatting (3DGS).
3. **Conversión a `.ksplat`:** la librería incluye un conversor en su repositorio:

   ```bash
   git clone https://github.com/mkkellogg/GaussianSplats3D.git /tmp/gs3d
   cd /tmp/gs3d && npm install
   node util/create-ksplat.js /ruta/renault4.ply /ruta/wilfredo-caro-marca/renault4-portal/public/assets/renault4.ksplat 0 1
   ```

   Parámetros: `[entrada] [salida] [nivel de compresión 0|1|2] [umbral de alfa]`.
   También puedes convertir desde la demo de la librería (botón de conversión).
4. **Ajuste de pose:** si el coche aparece tumbado o de lado, la captura tiene Z hacia arriba.
   En `src/config.ts`, cambia `scene.realScan.pitchRad` a `-Math.PI / 2`. Para tamaño y posición
   usa `scene.scale` y `scene.position`. El giro horizontal es `scene.realScan.yawRad`.
5. Recarga la página: aparecerá "Escaneo 3DGS real · /assets/renault4.ksplat".

La búsqueda sigue el orden `renault4.ksplat` → `renault4.splat` → `renault4.ply`, y se valida
con una petición HEAD. Un servidor SPA que devuelva HTML para un archivo que no existe no
se toma como escaneo.

## Despliegue en Cloudflare

Las cabeceras `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Embedder-Policy: require-corp`
están en `public/_headers` y `wrangler.toml` (Workers Static Assets las respeta). Sin ellas,
`SharedArrayBuffer` no existe y el sorting multihilo de los splats no funciona.

**Cloudflare Workers (recomendado):**

```bash
npx wrangler login
npm run deploy:workers        # vite build && wrangler deploy
```

**Cloudflare Pages (alternativa):**

```bash
npm run build
npx wrangler pages deploy dist --project-name=renault4-portal
```

Notas:
- Cloudflare limita el tamaño por archivo en Static Assets. Si el `.ksplat` supera ese límite,
  compresión nivel 1–2, recorte del fondo o alojamiento en R2.
- MediaPipe se carga desde `cdn.jsdelivr.net` y `storage.googleapis.com`. Con COEP `require-corp`,
  esos recursos deben responder con CORS. Si el CDN no lo permite, aloja el `.task` y el WASM
  en `public/` y actualiza `CONFIG.webcam` en `src/config.ts`.

## Limitaciones conocidas

- El modo procedural es una **aproximación estilizada**, no fotorrealista. El realismo lo da el
  escaneo 3DGS real.
- Los splats usan color horneado y no reciben luz. La iluminación del `THREE.Scene` sirve para
  mallas auxiliares.
- La profundidad por webcam depende del IPD medio y del FOV supuesto; ajusta
  `CONFIG.webcam.horizontalFovDeg` si la escala no cuadra con tu cámara.
- El giroscopio asume el móvil en vertical. Usa `CONFIG.orientation.invertY` si el movimiento vertical se siente al revés.
