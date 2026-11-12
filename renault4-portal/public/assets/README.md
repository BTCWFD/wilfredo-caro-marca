# Escaneo 3DGS real (opcional)

Coloca aquí el escaneo fotorrealista del Renault 4. La app lo busca en este orden y usa el primero que encuentre:

1. `renault4.ksplat` (recomendado: más ligero y con ordenado rápido)
2. `renault4.splat`
3. `renault4.ply`

Si no existe ninguno, la app genera el modelo procedural y muestra el aviso "Modo Demo Procedural".

Los archivos binarios de este directorio están en `.gitignore` para no subir escaneos pesados al repositorio.
Ver la guía de captura y conversión en `renault4-portal/README.md`.
