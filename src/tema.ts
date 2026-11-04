// Tema claro u oscuro: por defecto el del sistema; si la persona elige uno, se recuerda en este navegador
const CLAVE = 'jokoa_tema';
export type Tema = 'claro' | 'oscuro';

const guardado = (): Tema | null => {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === 'claro' || v === 'oscuro' ? v : null;
  } catch {
    return null;
  }
};

export const temaActual = (): Tema => guardado() ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro');

export function aplicarTema(): void {
  const t = guardado();
  if (t) document.documentElement.dataset.tema = t;
  else delete document.documentElement.dataset.tema;
}

export function cambiarTema(): Tema {
  const nuevo: Tema = temaActual() === 'oscuro' ? 'claro' : 'oscuro';
  try {
    localStorage.setItem(CLAVE, nuevo);
  } catch {
    /* sin almacenamiento: el cambio dura hasta recargar */
  }
  document.documentElement.dataset.tema = nuevo;
  return nuevo;
}
