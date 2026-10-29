import { Link } from 'react-router-dom';
import { esMovil, etiquetas, euros } from '../format';
import type { Producto } from '../types';
import Icon from './Icon';

export default function ProductCard({ p, i }: { p: Producto; i: number }) {
  const movil = esMovil(p);
  return (
    <Link to={`/producto/${movil ? 'moviles' : 'videojuegos'}/${p.id}`} className={'tarjeta producto entra' + (movil ? ' movil' : '')} style={{ ['--i' as string]: Math.min(i, 12) }}>
      <div className="foto">
        {p.imagenes[0] && <img src={p.imagenes[0]} alt={p.nombre} loading="lazy" />}
        {p.stock <= 0 && <span className="chip gris sin-stock">Sin stock</span>}
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
