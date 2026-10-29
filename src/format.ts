import type { Producto } from './types';

export const euros = (n: number): string =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

export const fechaCorta = (s: string | null | undefined): string => (s ? s.substring(0, 10) : '');

// Datos para las píldoras: plataforma/género/PEGI (juego) o marca/memoria/RAM (móvil)
export function etiquetas(p: Producto): string[] {
  return p.marca !== undefined
    ? [p.marca, `${p.almacenamiento_gb} GB`, `${p.ram_gb} GB RAM`]
    : [p.plataforma ?? '', p.genero ?? '', `PEGI ${p.pegi}`];
}

export const esMovil = (p: Producto): boolean => p.marca !== undefined;
