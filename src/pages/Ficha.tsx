import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useCart } from '../cart';
import { ErrorEstado } from '../components/Estados';
import Icon from '../components/Icon';
import { esMovil, etiquetas, euros } from '../format';
import { useToast } from '../toast';
import type { Producto } from '../types';

export default function Ficha() {
  const { tipo = 'videojuegos', id = '' } = useParams();
  const [p, setP] = useState<Producto | null>(null);
  const [error, setError] = useState(false);
  const [cant, setCant] = useState(1);
  const [dias, setDias] = useState(3);
  const [ocupado, setOcupado] = useState(false);
  const { anadir } = useCart();
  const aviso = useToast();
  const navegar = useNavigate();

  const cargar = () => {
    setError(false);
    api.get<Producto>(`/${tipo}/${id}`).then(setP).catch(() => setError(true));
  };
  useEffect(() => {
    setP(null);
    setCant(1);
    cargar();
  }, [tipo, id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <div className="contenedor pagina"><ErrorEstado onReintentar={cargar} texto="No se pudo cargar el producto" /></div>;
  if (!p) return <div className="contenedor pagina"><div className="tarjeta pulso" style={{ height: 420 }} /></div>;

  const movil = esMovil(p);
  const sinStock = p.stock <= 0;

  const alquilar = async () => {
    setOcupado(true);
    try {
      await api.post('/alquileres/add', { videojuego_id: p.id, dias });
      setP({ ...p, stock: p.stock - 1 });
      aviso(`Alquilado ${dias} día(s)`);
      navegar('/pedidos', { state: { pestana: 'alquileres' } });
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo alquilar');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="contenedor pagina">
      <Link to={movil ? '/moviles' : '/juegos'} className="migas">
        <Icon nombre="atras" tam={20} />
        {movil ? 'Móviles' : 'Videojuegos'}
      </Link>
      <div className="ficha">
        <div className={'portada' + (movil ? ' cuadrada' : '')}>
          <img src={p.imagenes[0]} alt={p.nombre} />
        </div>
        <div>
          <h1>{p.nombre}</h1>
          <div className="chips">
            {etiquetas(p).map((e, i) => (
              <span key={e} className={'chip' + (!movil && i === 2 ? ' contorno' : '')}>{e}</span>
            ))}
          </div>
          <div className="precio-fila">
            <span className="precio-grande">{euros(p.precio)}</span>
            {sinStock ? <span className="chip gris">Sin stock</span> : <span className="chip coral">Quedan {p.stock} unidades</span>}
          </div>
          <p className="descripcion">{p.descripcion}</p>
          <div className="compra">
            <div className="cantidad" aria-label="Cantidad">
              <button type="button" onClick={() => setCant(Math.max(1, cant - 1))} aria-label="Una menos">−</button>
              <span>{cant}</span>
              <button type="button" onClick={() => setCant(Math.min(p.stock, cant + 1))} aria-label="Una más">+</button>
            </div>
            <button
              className="btn grande"
              type="button"
              disabled={sinStock}
              onClick={() => {
                anadir(p, cant);
                aviso('Añadido al carrito');
              }}
            >
              <Icon nombre="carrito" tam={22} />
              Añadir al carrito
            </button>
          </div>
          {!movil && (
            <div className="tarjeta alquiler">
              <h3>Alquilar · {euros(p.precio_alquiler_dia ?? 0)} al día</h3>
              <div className="opciones-dias" role="radiogroup" aria-label="Días de alquiler">
                {[1, 3, 7].map((d) => (
                  <button key={d} type="button" role="radio" aria-checked={dias === d} className={dias === d ? 'sel' : ''} onClick={() => setDias(d)}>
                    {d} {d === 1 ? 'día' : 'días'}
                  </button>
                ))}
              </div>
              <button className="btn coral bloque grande" type="button" disabled={sinStock || ocupado} onClick={alquilar}>
                Alquilar {dias} {dias === 1 ? 'día' : 'días'} · {euros((p.precio_alquiler_dia ?? 0) * dias)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
