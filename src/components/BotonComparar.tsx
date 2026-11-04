import type { MouseEvent } from 'react';
import { useComparar } from '../comparar';
import type { Producto } from '../types';
import Icon from './Icon';

// Botón para añadir o quitar un producto de la comparación; dentro de una tarjeta-enlace no debe abrir la ficha
export default function BotonComparar({ p }: { p: Producto }) {
  const { items, alternar } = useComparar();
  const marcado = items.some((i) => i.id === p.id);
  const pulsar = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    alternar(p);
  };
  return (
    <button type="button" className={'btn-fav btn-comparar' + (marcado ? ' marcado' : '')} aria-pressed={marcado} aria-label={marcado ? 'Quitar de la comparación' : 'Comparar'} title={marcado ? 'Quitar de la comparación' : 'Comparar'} onClick={pulsar}>
      <Icon nombre="comparar" tam={22} />
    </button>
  );
}
