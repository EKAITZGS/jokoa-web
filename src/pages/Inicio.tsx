import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import Icon from '../components/Icon';

export default function Inicio() {
  const { usuario } = useAuth();
  return (
    <>
      <section className="heroe">
        <div className="contenedor">
          <div>
            <h1>Juegos y móviles para <em>jokalaris</em></h1>
            <p>Compra, alquila y recibe soporte técnico en un solo sitio. Con tiendas en Bilbao, Barakaldo, Getxo y Leioa.</p>
            <div className="botones">
              {usuario ? (
                <>
                  <Link className="btn grande" to="/juegos">Ver juegos</Link>
                  <Link className="btn grande tonal" to="/moviles">Ver móviles</Link>
                </>
              ) : (
                <>
                  <Link className="btn grande" to="/login">Entrar</Link>
                  <Link className="btn grande tonal" to="/registro">Crear cuenta</Link>
                </>
              )}
            </div>
          </div>
          <div className="logo-grande" aria-hidden="true"><i /><i /><i /><i /></div>
        </div>
      </section>
      <div className="contenedor">
        <div className="ventajas">
          <div className="tarjeta ventaja">
            <div className="circulo"><Icon nombre="carrito" /></div>
            <h3>Compra o alquila</h3>
            <p>Los juegos que quieras para siempre, o solo unos días: 1, 3 o 7.</p>
          </div>
          <div className="tarjeta ventaja">
            <div className="circulo"><Icon nombre="auricular" /></div>
            <h3>Soporte técnico</h3>
            <p>Abre un ticket para telefonía o consolas y sigue su estado.</p>
          </div>
          <div className="tarjeta ventaja">
            <div className="circulo"><Icon nombre="lugar" /></div>
            <h3>Cerca de ti</h3>
            <p>Encuentra tu tienda Jokoa en el mapa, con horario y cómo llegar.</p>
          </div>
        </div>
      </div>
    </>
  );
}
