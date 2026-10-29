import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useCart } from '../cart';
import Icon from './Icon';

export default function Layout() {
  const { usuario, esAdmin, salir } = useAuth();
  const { unidades } = useCart();
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    setMenu(false);
    setAbierto(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const cerrar = () => setMenu(false);
    document.addEventListener('click', cerrar);
    return () => document.removeEventListener('click', cerrar);
  }, [menu]);

  const clase = ({ isActive }: { isActive: boolean }) => (isActive ? 'activo' : undefined);

  return (
    <>
      <header className="cabecera">
        <div className="contenedor barra">
          <button className="icono-btn hamburguesa" type="button" aria-label="Abrir el menú" onClick={() => setAbierto(!abierto)}>
            <Icon nombre="menu" />
          </button>
          <Link to="/" className="marca">
            <img src="/logo.svg" alt="" />
            Jokoa
          </Link>
          {usuario && (
            <nav className={'nav' + (abierto ? ' abierto' : '')} aria-label="Principal">
              <NavLink to="/juegos" className={clase}>Juegos</NavLink>
              <NavLink to="/moviles" className={clase}>Móviles</NavLink>
              <NavLink to="/tiendas" className={clase}>Tiendas</NavLink>
              <NavLink to="/soporte" className={clase}>Soporte</NavLink>
            </nav>
          )}
          <div className="acciones-cab">
            {usuario ? (
              <>
                <Link to="/carrito" className="carrito-btn" aria-label={`Carrito, ${unidades} unidades`}>
                  <Icon nombre="carrito" tam={26} />
                  {unidades > 0 && <span className="num">{unidades}</span>}
                </Link>
                <div className="usuario-menu" onClick={(e) => e.stopPropagation()}>
                  <button className="usuario-btn" type="button" aria-expanded={menu} onClick={() => setMenu(!menu)}>
                    <span className="avatar">{usuario.nombre.charAt(0).toUpperCase()}</span>
                    <span className="nombre">{usuario.nombre}</span>
                  </button>
                  {menu && (
                    <div className="desplegable">
                      <div className="quien">
                        <b>{usuario.nombre} {usuario.apellidos}</b>
                        <span>{usuario.email}</span>
                      </div>
                      <Link to="/pedidos"><Icon nombre="carrito" tam={20} />Mis pedidos</Link>
                      <Link to="/perfil"><Icon nombre="usuario" tam={20} />Mi perfil</Link>
                      {esAdmin && <Link to="/admin"><Icon nombre="panel" tam={20} />Administración</Link>}
                      <button type="button" onClick={() => { salir(); navegar('/'); }}>
                        <Icon nombre="atras" tam={20} />Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link className="btn fantasma" to="/login">Entrar</Link>
                <Link className="btn" to="/registro">Crear cuenta</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="pie">
        <div className="contenedor">
          <span className="marca"><img src="/logo.svg" alt="" />Jokoa</span>
          <span>by JuegAlmi · Tienda de videojuegos y móviles en Bizkaia</span>
        </div>
      </footer>
    </>
  );
}
