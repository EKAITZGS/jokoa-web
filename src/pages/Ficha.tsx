import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useCart } from '../cart';
import BotonFavorito from '../components/BotonFavorito';
import { ErrorEstado } from '../components/Estados';
import Icon from '../components/Icon';
import { volarAlCarrito } from '../efectos';
import { contenida, esArticulo, etiquetas, euros, fichaTecnica } from '../format';
import { useToast } from '../toast';
import type { Producto } from '../types';

// Sección de la tienda a la que pertenece cada categoría de artículo
const rutaSeccion = (categoria: string): [string, string] =>
  ['portatil', 'sobremesa', 'pc_gaming'].includes(categoria) ? ['/ordenadores', 'Ordenadores'] : categoria === 'tablet' ? ['/tablets', 'Tablets'] : ['/gaming', 'Zona gaming'];

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

  const movil = contenida(p);
  const articulo = esArticulo(p);
  const juego = !articulo && p.plataforma !== undefined;
  const ficha = fichaTecnica(p);
  const sinStock = p.stock <= 0;
  const vuelta = articulo ? rutaSeccion(p.categoria ?? '') : juego ? ['/juegos', 'Videojuegos'] : ['/moviles', 'Móviles'];

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
      <Link to={vuelta[0]} className="migas" viewTransition>
        <Icon nombre="atras" tam={20} />
        {vuelta[1]}
      </Link>
      <div className="ficha">
        <div className={'portada' + (movil ? ' cuadrada' : '')}>
          <img src={p.imagenes[0]} alt={p.nombre} style={{ ['viewTransitionName' as string]: `foto-${p.id}` } as React.CSSProperties} />
          <BotonFavorito id={p.id} />
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
          {!!p.montaje && <p className="nota-montaje">Montado y probado en Jokoa: el precio incluye {euros(p.montaje)} de montaje.</p>}
          {p.garantias && p.garantias.length > 0 && <p className="nota-montaje">Garantía ampliada disponible al comprar: {p.garantias.map((g) => `+${g.meses} meses (${euros(g.precio)})`).join(' · ')}.</p>}
          <div className="compra">
            <div className="cantidad" aria-label="Cantidad">
              <button type="button" onClick={() => setCant(Math.max(1, cant - 1))} aria-label="Una menos">−</button>
              <span key={cant}>{cant}</span>
              <button type="button" onClick={() => setCant(Math.min(p.stock, cant + 1))} aria-label="Una más">+</button>
            </div>
            <button
              className="btn grande"
              type="button"
              disabled={sinStock}
              onClick={() => {
                volarAlCarrito(document.querySelector('.ficha .portada img'));
                anadir(p, cant);
                aviso('Añadido al carrito');
              }}
            >
              <Icon nombre="carrito" tam={22} />
              Añadir al carrito
            </button>
          </div>
          {juego && (
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
          {ficha.length > 0 && (
            <dl className="tarjeta ficha-tecnica">
              {ficha.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
