import type { CSSProperties, ReactNode } from 'react';
import { useRevelar } from '../efectos';

// Envuelve un bloque para que aparezca suavemente al llegar a él con el scroll
export default function Revelar({ children, i = 0, className = '' }: { children: ReactNode; i?: number; className?: string }) {
  const ref = useRevelar<HTMLDivElement>();
  return (
    <div ref={ref} className={'revelar ' + className} style={{ ['--i' as string]: i } as CSSProperties}>
      {children}
    </div>
  );
}
