import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Producto } from './types';

export interface LineaCarrito {
  producto: Producto;
  cantidad: number;
  garantia?: number | null; // meses de garantía ampliada elegidos
}

// Precio por unidad de la garantía elegida; el servidor lo vuelve a calcular al comprar
export const precioGarantia = (l: LineaCarrito): number => l.producto.garantias?.find((g) => g.meses === l.garantia)?.precio ?? 0;
interface Carrito {
  lineas: LineaCarrito[];
  unidades: number;
  total: number;
  anadir: (p: Producto, cantidad?: number) => void;
  cambiar: (id: number, cantidad: number) => void;
  quitar: (id: number) => void;
  garantia: (id: number, meses: number | null) => void;
  vaciar: () => void;
}
const Ctx = createContext<Carrito>(null as unknown as Carrito);
export const useCart = () => useContext(Ctx);

const CLAVE = 'jokoa_carrito';

// El carrito vive en el navegador; al finalizar se envía de una vez a POST /compras/add
export function CartProvider({ children }: { children: ReactNode }) {
  const [lineas, setLineas] = useState<LineaCarrito[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
    } catch {
      return [];
    }
  });
  useEffect(() => localStorage.setItem(CLAVE, JSON.stringify(lineas)), [lineas]);

  const limite = (p: Producto, n: number) => Math.max(1, Math.min(n, p.stock));
  const anadir = (p: Producto, cantidad = 1) =>
    setLineas((ls) => {
      const existe = ls.find((l) => l.producto.id === p.id);
      return existe
        ? ls.map((l) => (l.producto.id === p.id ? { producto: p, cantidad: limite(p, l.cantidad + cantidad), garantia: l.garantia } : l))
        : [...ls, { producto: p, cantidad: limite(p, cantidad) }];
    });
  const cambiar = (id: number, cantidad: number) =>
    setLineas((ls) => ls.map((l) => (l.producto.id === id ? { ...l, cantidad: limite(l.producto, cantidad) } : l)));
  const quitar = (id: number) => setLineas((ls) => ls.filter((l) => l.producto.id !== id));
  const garantia = (id: number, meses: number | null) => setLineas((ls) => ls.map((l) => (l.producto.id === id ? { ...l, garantia: meses } : l)));
  const vaciar = () => setLineas([]);

  const unidades = lineas.reduce((s, l) => s + l.cantidad, 0);
  const total = lineas.reduce((s, l) => s + l.cantidad * (l.producto.precio + precioGarantia(l)), 0);
  return <Ctx.Provider value={{ lineas, unidades, total, anadir, cambiar, quitar, garantia, vaciar }}>{children}</Ctx.Provider>;
}
