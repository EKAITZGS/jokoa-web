import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, alSesionCaducada, token } from './api';
import type { Usuario } from './types';

interface Sesion {
  usuario: Usuario | null;
  cargando: boolean;
  esAdmin: boolean;
  entrar: (email: string, password: string) => Promise<void>;
  salir: () => void;
  refrescar: () => Promise<void>;
}
const Ctx = createContext<Sesion>(null as unknown as Sesion);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(token.valido());

  const salir = useCallback(() => {
    token.quitar();
    setUsuario(null);
  }, []);

  const refrescar = useCallback(async () => {
    setUsuario(await api.get<Usuario>('/perfil'));
  }, []);

  useEffect(() => {
    alSesionCaducada(salir);
    if (!token.valido()) {
      token.quitar();
      setCargando(false);
      return;
    }
    refrescar()
      .catch(salir)
      .finally(() => setCargando(false));
  }, [refrescar, salir]);

  const entrar = async (email: string, password: string) => {
    const r = await api.post<{ token: string }>('/login', { email, password });
    token.set(r.token);
    await refrescar();
  };

  const esAdmin = !!usuario?.roles.includes('ROLE_ADMIN');
  return <Ctx.Provider value={{ usuario, cargando, esAdmin, entrar, salir, refrescar }}>{children}</Ctx.Provider>;
}
