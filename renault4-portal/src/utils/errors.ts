/** Texto legible para cualquier error, incluidos los Event de carga de scripts o WASM. */
export function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof Event !== 'undefined' && err instanceof Event) {
    return 'no se pudo descargar un recurso (red o CDN bloqueado)';
  }
  return String(err);
}
