import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface Aviso {
  id: number;
  texto: string;
}
const Ctx = createContext<(texto: string) => void>(() => {});
export const useToast = () => useContext(Ctx);

// Avisos breves abajo a la izquierda (compra hecha, error de red...)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const mostrar = useCallback((texto: string) => {
    const id = Date.now() + Math.random();
    setAvisos((a) => [...a, { id, texto }]);
    setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={mostrar}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className="aviso">
            {a.texto}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
