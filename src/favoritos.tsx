import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, ApiError } from './api';
import { useAuth } from './auth';
import { useToast } from './toast';

interface Favs {
  ids: Set<number>;
  alternar: (id: number) => Promise<void>;
}
const Ctx = createContext<Favs>({ ids: new Set(), alternar: async () => {} });
export const useFavoritos = () => useContext(Ctx);

// Ids de los productos con corazón del usuario; el corazón cambia al instante y se deshace si el servidor falla
export function FavProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const aviso = useToast();
  const [ids, setIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setIds(new Set());
    if (!usuario) return;
    api.get<number[]>('/favoritos').then((l) => setIds(new Set(l))).catch(() => {});
  }, [usuario]);

  const alternar = useCallback(async (id: number) => {
    const era = ids.has(id);
    const poner = (marcado: boolean) => setIds((s) => { const n = new Set(s); if (marcado) n.add(id); else n.delete(id); return n; });
    poner(!era);
    try {
      if (era) await api.borrar(`/favoritos/${id}`);
      else await api.put(`/favoritos/${id}`, {});
    } catch (e) {
      poner(era);
      aviso(e instanceof ApiError ? e.message : 'No se pudo actualizar tus favoritos');
    }
  }, [ids, aviso]);

  return <Ctx.Provider value={{ ids, alternar }}>{children}</Ctx.Provider>;
}
