import { useRef, type CSSProperties, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import Icon from '../components/Icon';
import Revelar from '../components/Revelar';
import { conRaton } from '../efectos';

const palabras = (texto: string, desde: number) =>
  texto.split(' ').map((p, k) => (
    <span key={k}>
      <span className="pal" style={{ ['--i' as string]: desde + k } as CSSProperties}>{p}</span>{' '}
    </span>
  ));

export default function Inicio() {
  const { usuario } = useAuth();
  const heroe = useRef<HTMLElement>(null);

  // El logo grande se desplaza un poco siguiendo al ratón (parallax)
  const mover = (e: MouseEvent<HTMLElement>) => {
    if (!conRaton() || !heroe.current) return;
    const r = heroe.current.getBoundingClientRect();
    heroe.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    heroe.current.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };

  return (
    <>
      <section className="heroe" ref={heroe} onMouseMove={mover}>
        <span className="flota f1" aria-hidden="true" />
        <span className="flota f2" aria-hidden="true" />
        <span className="flota f3" aria-hidden="true" />
        <div className="contenedor">
          <div>
            <h1>
              {palabras('Juegos y móviles para', 0)}
              <em>{palabras('jokalaris', 4)}</em>
            </h1>
            <p>Compra, alquila y recibe soporte técnico en un solo sitio. Con tiendas en Bilbao, Barakaldo, Getxo y Leioa.</p>
            <div className="botones">
              {usuario ? (
                <>
                  <Link className="btn grande" to="/juegos">Ver juegos</Link>
                  <Link className="btn grande tonal" to="/moviles">Ver móviles</Link>
                  <Link className="btn grande tonal" to="/ordenadores">Ordenadores</Link>
                  <Link className="btn grande tonal" to="/gaming">Zona gaming</Link>
                </>
              ) : (
                <>
                  <Link className="btn grande" to="/login">Entrar</Link>
                  <Link className="btn grande tonal" to="/registro">Crear cuenta</Link>
                </>
              )}
            </div>
          </div>
          <div className="logo-grande" aria-hidden="true">
            <i style={{ ['--i' as string]: 0 } as CSSProperties} />
            <i style={{ ['--i' as string]: 1 } as CSSProperties} />
            <i style={{ ['--i' as string]: 2 } as CSSProperties} />
            <i style={{ ['--i' as string]: 3 } as CSSProperties} />
          </div>
        </div>
      </section>
      <div className="contenedor">
        <div className="ventajas">
          <Revelar i={0}>
            <div className="tarjeta ventaja">
              <div className="circulo"><Icon nombre="carrito" /></div>
              <h3>Compra o alquila</h3>
              <p>Los juegos que quieras para siempre, o solo unos días: 1, 3 o 7.</p>
            </div>
          </Revelar>
          <Revelar i={1}>
            <div className="tarjeta ventaja">
              <div className="circulo"><Icon nombre="auricular" /></div>
              <h3>Soporte técnico</h3>
              <p>Abre un ticket para telefonía o consolas y sigue su estado.</p>
            </div>
          </Revelar>
          <Revelar i={2}>
            <div className="tarjeta ventaja">
              <div className="circulo"><Icon nombre="lugar" /></div>
              <h3>Cerca de ti</h3>
              <p>Encuentra tu tienda Jokoa en el mapa, con horario y cómo llegar.</p>
            </div>
          </Revelar>
        </div>
      </div>
    </>
  );
}
