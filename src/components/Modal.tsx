import { useEffect, type ReactNode } from 'react';
import Icon from './Icon';

interface Props {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
  pie?: ReactNode;
  estrecho?: boolean;
}

// Diálogo: radio 16, sombra de nivel 3, fondo oscurecido al 55 % y entrada de 220 ms
export default function Modal({ titulo, onClose, children, pie, estrecho }: Props) {
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [onClose]);
  return (
    <div className="modal-fondo" onMouseDown={onClose}>
      <div className={'modal' + (estrecho ? ' estrecho' : '')} role="dialog" aria-modal="true" aria-label={titulo} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-cab">
          <h2>{titulo}</h2>
          <button className="icono-btn" type="button" onClick={onClose} aria-label="Cerrar">
            <Icon nombre="cerrar" />
          </button>
        </div>
        <div className="modal-cuerpo">{children}</div>
        {pie && <div className="modal-pie">{pie}</div>}
      </div>
    </div>
  );
}
