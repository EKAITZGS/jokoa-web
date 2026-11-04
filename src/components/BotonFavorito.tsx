import type { MouseEvent } from 'react';
import { useFavoritos } from '../favoritos';
import Icon from './Icon';

// Corazón para marcar un producto; dentro de una tarjeta-enlace no debe abrir la ficha
export default function BotonFavorito({ id }: { id: number }) {
  const { ids, alternar } = useFavoritos();
  const marcado = ids.has(id);
  const pulsar = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    alternar(id);
  };
  return (
    <button type="button" className={'btn-fav' + (marcado ? ' marcado' : '')} aria-pressed={marcado} aria-label={marcado ? 'Quitar de favoritos' : 'Añadir a favoritos'} onClick={pulsar}>
      <Icon nombre={marcado ? 'corazon' : 'corazonBorde'} tam={22} />
    </button>
  );
}
