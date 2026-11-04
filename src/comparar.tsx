import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useToast } from './toast';
import type { Producto } from './types';

export const MAX_COMPARAR = 3;

interface Comp {
  items: Producto[];
  alternar: (p: Producto) => void;
  quitar: (id: number) => void;
  vaciar: () => void;
}
const Ctx = createContext<Comp>({ items: [], alternar: () => {}, quitar: () => {}, vaciar: () => {} });
export const useComparar = () => useContext(Ctx);

// Hasta tres productos elegidos para compararlos; se recuerdan mientras la pestaña esté abierta
export function CompararProvider({ children }: { children: ReactNode }) {
  const aviso = useToast();
  const [items, setItems] = useState<Producto[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('jokoa_comparar') ?? '[]');
    } catch {
      return [];
    }
  });

  const guardar = (nuevos: Producto[]) => {
    setItems(nuevos);
    try {
      sessionStorage.setItem('jokoa_comparar', JSON.stringify(nuevos));
    } catch {
      /* sin almacenamiento: solo se pierde al recargar */
    }
  };

  const alternar = useCallback((p: Producto) => {
    if (items.some((i) => i.id === p.id)) return guardar(items.filter((i) => i.id !== p.id));
    if (items.length >= MAX_COMPARAR) return aviso(`Solo puedes comparar ${MAX_COMPARAR} productos a la vez`);
    guardar([...items, p]);
  }, [items, aviso]); // eslint-disable-line react-hooks/exhaustive-deps

  const quitar = useCallback((id: number) => guardar(items.filter((i) => i.id !== id)), [items]); // eslint-disable-line react-hooks/exhaustive-deps
  const vaciar = useCallback(() => guardar([]), []);

  return <Ctx.Provider value={{ items, alternar, quitar, vaciar }}>{children}</Ctx.Provider>;
}
