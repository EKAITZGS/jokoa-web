// Peticiones a la API de Symfony (/ws), la misma que usan las apps de Android e Ionic
const CLAVE = 'jokoa_token';

export class ApiError extends Error {
  status: number;
  constructor(mensaje: string, status: number) {
    super(mensaje);
    this.status = status;
  }
}

export const token = {
  get: (): string | null => localStorage.getItem(CLAVE),
  set: (t: string) => localStorage.setItem(CLAVE, t),
  quitar: () => localStorage.removeItem(CLAVE),
  // El token caduca (8 h): si ya ha caducado no cuenta como sesión
  valido: (): boolean => {
    const t = localStorage.getItem(CLAVE);
    if (!t) return false;
    try {
      const carga = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return !carga.exp || carga.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};

let alCaducar: () => void = () => {};
export const alSesionCaducada = (fn: () => void) => {
  alCaducar = fn;
};

async function peticion<T>(metodo: string, ruta: string, cuerpo?: unknown, formulario?: FormData): Promise<T> {
  const cabeceras: Record<string, string> = {};
  const t = token.get();
  if (t) cabeceras.Authorization = `Bearer ${t}`;
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch('/ws' + ruta, {
      method: metodo,
      headers: cabeceras,
      body: formulario ?? (cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined),
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0);
  }
  let datos: any = null;
  try {
    datos = await res.json();
  } catch {
    /* respuesta sin cuerpo JSON */
  }
  if (!res.ok) {
    // Un 401 con sesión guardada es un token caducado o una cuenta desactivada
    if (res.status === 401 && t && ruta !== '/login') alCaducar();
    throw new ApiError(datos?.mensaje ?? datos?.message ?? 'Ha ocurrido un error', res.status);
  }
  return datos as T;
}

// Descarga un archivo (p. ej. una factura PDF) con el token de la sesión
async function archivo(ruta: string): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch('/ws' + ruta, { headers: { Authorization: `Bearer ${token.get() ?? ''}` } });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0);
  }
  if (!res.ok) throw new ApiError(res.status === 404 ? 'No se encontró el documento' : 'No se pudo descargar el documento', res.status);
  return res.blob();
}

export const api = {
  archivo,
  get: <T,>(ruta: string) => peticion<T>('GET', ruta),
  post: <T,>(ruta: string, cuerpo: unknown) => peticion<T>('POST', ruta, cuerpo),
  put: <T,>(ruta: string, cuerpo: unknown = {}) => peticion<T>('PUT', ruta, cuerpo),
  borrar: <T,>(ruta: string) => peticion<T>('DELETE', ruta),
  subir: <T,>(ruta: string, formulario: FormData) => peticion<T>('POST', ruta, undefined, formulario),
};
