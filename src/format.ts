import type { Producto, Ticket, Tipo } from './types';

export const ETIQUETA_ESTADO: Record<Ticket['estado'], string> = {
  abierto: 'Abierto', en_proceso: 'En curso', cerrado: 'Cerrado',
  recibido: 'Recibido', presupuestado: 'Presupuesto listo', en_reparacion: 'En reparación', listo: 'Listo para recoger',
};
// Estados que puede tener cada tipo de ticket, en orden
export const ESTADOS_TICKET: Record<Ticket['tipo'], Ticket['estado'][]> = {
  soporte: ['abierto', 'en_proceso', 'cerrado'],
  reparacion: ['recibido', 'presupuestado', 'en_reparacion', 'listo', 'cerrado'],
};

export const euros = (n: number): string =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

export const fechaCorta = (s: string | null | undefined): string => (s ? s.substring(0, 10) : '');

export const esArticulo = (p: Producto): boolean => p.categoria !== undefined;
export const esMovil = (p: Producto): boolean => p.ram_gb !== undefined;

// Móviles y fotos de artículos se muestran enteras sobre fondo blanco; las tarjetas SVG y las portadas ocupan todo el marco
export const contenida = (p: Producto): boolean => (esMovil(p) || esArticulo(p)) && !p.imagenes[0]?.endsWith('.svg');

// Ruta de la API y de la ficha según el tipo de producto
export const rutaTipo = (p: Producto): Tipo => (esArticulo(p) ? 'articulos' : esMovil(p) ? 'moviles' : 'videojuegos');

export const CATEGORIAS: Record<string, string> = {
  portatil: 'Portátiles', sobremesa: 'Sobremesa', pc_gaming: 'PC gaming Jokoa', tablet: 'Tablets', consola: 'Consolas', mando: 'Mandos',
  auriculares: 'Auriculares', teclado: 'Teclados', raton: 'Ratones', monitor: 'Monitores', silla: 'Sillas gaming',
};

// Qué datos técnicos se resumen en la tarjeta de cada categoría
const RESUMEN: Record<string, string[]> = {
  portatil: ['procesador', 'ram_gb'], sobremesa: ['procesador', 'ram_gb'], pc_gaming: ['grafica', 'ram_gb'], tablet: ['pantalla', 'almacenamiento_gb'],
  consola: ['almacenamiento', 'resolucion'], mando: ['compatible'], auriculares: ['tipo', 'compatible'], teclado: ['formato', 'tipo'],
  raton: ['conexion', 'peso_g'], monitor: ['tamano', 'frecuencia_hz'], silla: ['material', 'reposabrazos'],
};

const ETIQUETA_DATO: Record<string, string> = {
  ram_gb: 'RAM', almacenamiento_gb: 'Almacenamiento', peso_kg: 'Peso', peso_g: 'Peso', peso_max_kg: 'Peso máximo', frecuencia_hz: 'Frecuencia',
  dpi_max: 'DPI máximo', tamano: 'Tamaño', grafica: 'Gráfica', bateria: 'Batería', conexion: 'Conexión', microfono: 'Micrófono',
  iluminacion: 'Iluminación', resolucion: 'Resolución', lapiz: 'Lápiz', ideal_para: 'Ideal para', cinco_g: '5G', camara: 'Cámara', subgenero: 'Subgénero',
};

const UNIDAD: Record<string, string> = { ram_gb: ' GB', almacenamiento_gb: ' GB', peso_kg: ' kg', peso_g: ' g', peso_max_kg: ' kg', frecuencia_hz: ' Hz' };

const nombreDato = (k: string) => ETIQUETA_DATO[k] ?? k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' ');
const valorDato = (k: string, v: unknown): string =>
  typeof v === 'boolean' ? (v ? 'Sí' : 'No') : Array.isArray(v) ? v.join(', ') : `${v}${typeof v === 'number' ? UNIDAD[k] ?? '' : ''}`;

// Ficha técnica de un producto: todos los datos menos las etiquetas internas
export const fichaTecnica = (p: Producto): [string, string][] =>
  Object.entries(p.caracteristicas ?? {})
    .filter(([k]) => k !== 'etiquetas')
    .map(([k, v]) => [nombreDato(k), valorDato(k, v)]);

// Datos para las píldoras: plataforma/género/PEGI (juego), marca/memoria/RAM (móvil) o marca y dos datos clave (artículo)
export function etiquetas(p: Producto): string[] {
  if (esArticulo(p)) {
    const car = p.caracteristicas ?? {};
    const datos = (RESUMEN[p.categoria ?? ''] ?? []).filter((k) => car[k] !== undefined).map((k) => valorDato(k, car[k]));
    return [p.marca ?? '', ...datos];
  }
  return esMovil(p)
    ? [p.marca ?? '', `${p.almacenamiento_gb} GB`, `${p.ram_gb} GB RAM`]
    : [p.plataforma ?? '', p.genero ?? '', `PEGI ${p.pegi}`];
}
