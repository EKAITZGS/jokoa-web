import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useCart } from '../cart';
import { Vacio } from '../components/Estados';
import Icon from '../components/Icon';
import { esMovil, euros } from '../format';
import { useToast } from '../toast';

export default function Carrito() {
  const { lineas, unidades, total, cambiar, quitar, vaciar } = useCart();
  const [ocupado, setOcupado] = useState(false);
  const aviso = useToast();
  const navegar = useNavigate();

  const comprar = async () => {
    setOcupado(true);
    try {
      await api.post('/compras/add', { lineas: lineas.map((l) => ({ producto_id: l.producto.id, cantidad: l.cantidad })) });
      vaciar();
      aviso('¡Compra realizada!');
      navegar('/pedidos');
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo completar la compra');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="contenedor pagina">
      <div className="pagina-cab">
        <h1>Tu carrito</h1>
      </div>
      {lineas.length === 0 ? (
        <>
          <Vacio icono="carrito" texto="Tu carrito está vacío" />
          <div style={{ textAlign: 'center' }}>
            <Link className="btn" to="/juegos">Ver juegos</Link>
          </div>
        </>
      ) : (
        <div className="carrito">
          <div>
            {lineas.map(({ producto: p, cantidad }) => (
              <div key={p.id} className="tarjeta linea-carrito">
                <img className={esMovil(p) ? 'movil' : ''} src={p.imagenes[0]} alt={p.nombre} />
                <div>
                  <h3><Link to={`/producto/${esMovil(p) ? 'moviles' : 'videojuegos'}/${p.id}`}>{p.nombre}</Link></h3>
                  <div className="sub">{euros(p.precio)} la unidad · quedan {p.stock}</div>
                  <div className="cantidad" style={{ marginTop: 10 }}>
                    <button type="button" onClick={() => cambiar(p.id, cantidad - 1)} aria-label="Una menos">−</button>
                    <span>{cantidad}</span>
                    <button type="button" onClick={() => cambiar(p.id, cantidad + 1)} aria-label="Una más">+</button>
                  </div>
                </div>
                <div className="fin">
                  <span className="precio">{euros(p.precio * cantidad)}</span>
                  <button className="icono-btn peligro" type="button" onClick={() => quitar(p.id)} aria-label={`Quitar ${p.nombre}`}>
                    <Icon nombre="basura" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <aside className="tarjeta resumen">
            <h2>Resumen</h2>
            <div className="fila"><span>Productos</span><span>{unidades}</span></div>
            <div className="fila total"><span>Total</span><span>{euros(total)}</span></div>
            <button className="btn grande bloque" type="button" disabled={ocupado} onClick={comprar}>Finalizar compra</button>
            <button className="btn fantasma bloque" type="button" style={{ marginTop: 8 }} onClick={vaciar}>Vaciar carrito</button>
          </aside>
        </div>
      )}
    </div>
  );
}
