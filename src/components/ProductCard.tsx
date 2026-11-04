import type { CSSProperties, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { conRaton } from '../efectos';
import { contenida, etiquetas, euros, rutaTipo } from '../format';
import type { Producto } from '../types';
import BotonComparar from './BotonComparar';
import BotonFavorito from './BotonFavorito';
import Icon from './Icon';

// La tarjeta se inclina hacia el ratón y la foto "viaja" hasta la ficha con una transición de vista
export default function ProductCard({ p, i }: { p: Producto; i: number }) {
  const movil = contenida(p);

  const inclinar = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!conRaton()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-y * 9).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 11).toFixed(2)}deg`);
  };
  const soltar = (e: MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };

  return (
    <Link
      to={`/producto/${rutaTipo(p)}/${p.id}`}
      viewTransition
      className={'tarjeta producto entra' + (movil ? ' movil' : '')}
      style={{ ['--i' as string]: Math.min(i, 12) } as CSSProperties}
      onMouseMove={inclinar}
      onMouseLeave={soltar}
    >
      <div className="foto">
        {p.imagenes[0] && <img src={p.imagenes[0]} alt={p.nombre} loading="lazy" style={{ ['viewTransitionName' as string]: `foto-${p.id}` } as CSSProperties} />}
        {p.stock <= 0 && <span className="chip gris sin-stock">Sin stock</span>}
        <BotonFavorito id={p.id} />
        <BotonComparar p={p} />
      </div>
      <div className="cuerpo">
        <h3>{p.nombre}</h3>
        <div className="detalle">{etiquetas(p).join(' · ')}</div>
        <div className="pie-tarjeta">
          <span className="precio">{euros(p.precio)}</span>
          <span className="ir">
            <Icon nombre="flecha" tam={20} />
          </span>
        </div>
      </div>
    </Link>
  );
}
