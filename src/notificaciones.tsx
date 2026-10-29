import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { api } from './api';
import { useAuth } from './auth';
import { useToast } from './toast';

interface Resumen {
  total: number;
  tickets: { id: number; asunto: string; no_leidos: number }[];
}
interface Notif {
  total: number; // mensajes de soporte sin leer
  refrescar: () => Promise<void>;
}
const Ctx = createContext<Notif>({ total: 0, refrescar: async () => {} });
export const useNotif = () => useContext(Ctx);

const TITULO = 'Jokoa · Juegos y móviles';

// Pregunta cada pocos segundos si hay mensajes de soporte sin leer y avisa cuando llega uno nuevo
export function NotifProvider({ children }: { children: ReactNode }) {
  const { usuario, esAdmin } = useAuth();
  const aviso = useToast();
  const [total, setTotal] = useState(0);
  const previo = useRef<number | null>(null);

  const refrescar = useCallback(async () => {
    if (!usuario) return;
    try {
      const r = await api.get<Resumen>('/tickets/no-leidos');
      setTotal(r.total);
      if (previo.current === null) {
        // Al entrar se avisa una sola vez por sesión
        if (r.total > 0 && !sessionStorage.getItem('jokoa_aviso_soporte')) {
          sessionStorage.setItem('jokoa_aviso_soporte', '1');
          aviso(`Tienes ${r.total} mensaje${r.total > 1 ? 's' : ''} sin leer en Soporte`);
        }
      } else if (r.total > previo.current) {
        const nuevo = r.tickets[0];
        aviso(esAdmin ? `Nuevo mensaje de un cliente en «${nuevo?.asunto ?? 'Soporte'}»` : `Soporte te ha respondido en «${nuevo?.asunto ?? 'tu ticket'}»`);
      }
      previo.current = r.total;
    } catch {
      /* sin conexión: se vuelve a intentar en el siguiente ciclo */
    }
  }, [usuario, esAdmin, aviso]);

  useEffect(() => {
    previo.current = null;
    setTotal(0);
    if (!usuario) return;
    refrescar();
    const ciclo = setInterval(refrescar, 20000);
    const alVolver = () => document.visibilityState === 'visible' && refrescar();
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      clearInterval(ciclo);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [usuario, refrescar]);

  // El número también aparece en el título de la pestaña: (2) Jokoa · …
  useEffect(() => {
    document.title = (total > 0 ? `(${total}) ` : '') + TITULO;
  }, [total]);

  return <Ctx.Provider value={{ total, refrescar }}>{children}</Ctx.Provider>;
}
