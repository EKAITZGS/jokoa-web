import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { ErrorEstado } from '../components/Estados';
import { useContador } from '../efectos';
import { euros } from '../format';

const N = ({ v }: { v: number }) => <>{Math.round(useContador(v))}</>;
const Eu = ({ v }: { v: number }) => <>{euros(useContador(v, 1100, 2))}</>;
import type { Producto, Resumen } from '../types';

export default function ResumenAdmin() {
  const [r, setR] = useState<Resumen | null>(null);
  const [bajos, setBajos] = useState<(Producto & { tipo: string })[]>([]);
  const [error, setError] = useState(false);

  const cargar = () => {
    setError(false);
    Promise.all([api.get<Resumen>('/admin/resumen'), api.get<Producto[]>('/videojuegos'), api.get<Producto[]>('/moviles')])
      .then(([res, juegos, moviles]) => {
        setR(res);
        setBajos([...juegos.map((p) => ({ ...p, tipo: 'Videojuego' })), ...moviles.map((p) => ({ ...p, tipo: 'Móvil' }))].filter((p) => p.stock <= 3).sort((a, b) => a.stock - b.stock));
      })
      .catch(() => setError(true));
  };
  useEffect(cargar, []);

  if (error) return <ErrorEstado onReintentar={cargar} />;
  if (!r) return <div className="tarjeta pulso" style={{ height: 240 }} />;

  return (
    <>
      <div className="admin-cab">
        <div>
          <h1>Resumen</h1>
          <p>Así está la tienda ahora mismo.</p>
        </div>
      </div>
      <div className="cifras">
        <div className="tarjeta cifra"><div className="etiqueta">Usuarios</div><div className="valor"><N v={r.usuarios} /></div><div className="detalle">{r.usuarios_activos} activos</div></div>
        <div className="tarjeta cifra"><div className="etiqueta">Productos</div><div className="valor"><N v={r.videojuegos + r.moviles} /></div><div className="detalle">{r.videojuegos} juegos y {r.moviles} móviles</div></div>
        <div className="tarjeta cifra"><div className="etiqueta">Compras</div><div className="valor"><N v={r.compras} /></div><div className="detalle"><Eu v={r.ingresos} /> facturados</div></div>
        <div className="tarjeta cifra"><div className="etiqueta">Alquileres activos</div><div className="valor"><N v={r.alquileres_activos} /></div><div className="detalle">sin devolver</div></div>
        <div className={'tarjeta cifra' + (r.tickets_abiertos ? ' aviso-cifra' : '')}><div className="etiqueta">Tickets sin cerrar</div><div className="valor"><N v={r.tickets_abiertos} /></div><div className="detalle"><Link to="/admin/tickets" style={{ color: 'var(--azul)', fontWeight: 700 }}>Ver tickets</Link></div></div>
        <div className={'tarjeta cifra' + (r.stock_bajo ? ' aviso-cifra' : '')}><div className="etiqueta">Poco stock</div><div className="valor"><N v={r.stock_bajo} /></div><div className="detalle">3 unidades o menos</div></div>
      </div>
      <div className="tarjeta panel">
        <div className="panel-cab">
          <h2>Productos con poco stock</h2>
          <Link className="btn pequeno tonal" to="/admin/productos">Gestionar productos</Link>
        </div>
        {bajos.length === 0 ? (
          <div className="vacio-tabla">Todos los productos tienen stock suficiente.</div>
        ) : (
          <div className="tabla-caja">
            <table className="tabla">
              <thead><tr><th>Producto</th><th>Tipo</th><th className="num">Precio</th><th className="num">Stock</th></tr></thead>
              <tbody>
                {bajos.map((p) => (
                  <tr key={p.tipo + p.id}>
                    <td className="principal">{p.nombre}</td>
                    <td>{p.tipo}</td>
                    <td className="num">{euros(p.precio)}</td>
                    <td className="num"><span className={'chip ' + (p.stock === 0 ? 'gris' : 'coral')}>{p.stock === 0 ? 'Agotado' : `Quedan ${p.stock}`}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
