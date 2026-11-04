import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useCart } from '../cart';
import { useComparar } from '../comparar';
import { useNotif } from '../notificaciones';
import { cambiarTema, temaActual } from '../tema';
import AsistenteChat from './AsistenteChat';
import Icon from './Icon';

export default function Layout() {
  const { usuario, esAdmin, salir } = useAuth();
  const { unidades } = useCart();
  const { total: sinLeer } = useNotif();
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const { items: comparados, vaciar: vaciarComparados } = useComparar();
  const [texto, setTexto] = useState('');
  const [menu, setMenu] = useState(false);
  const [tema, setTema] = useState(temaActual());
  const [abierto, setAbierto] = useState(false);
  const [elevada, setElevada] = useState(false);
  const [oculta, setOculta] = useState(false);
  const ultimo = useRef(0);

  useEffect(() => {
    setMenu(false);
    setAbierto(false);
    setOculta(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  // La cabecera gana sombra al bajar y se esconde al seguir bajando; vuelve en cuanto se sube
  useEffect(() => {
    const alMover = () => {
      const y = window.scrollY;
      setElevada(y > 8);
      setOculta(y > 220 && y > ultimo.current + 4);
      if (y < ultimo.current - 4) setOculta(false);
      ultimo.current = y;
    };
    window.addEventListener('scroll', alMover, { passive: true });
    return () => window.removeEventListener('scroll', alMover);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const cerrar = () => setMenu(false);
    document.addEventListener('click', cerrar);
    return () => document.removeEventListener('click', cerrar);
  }, [menu]);

  const clase = ({ isActive }: { isActive: boolean }) => (isActive ? 'activo' : undefined);

  return (
    <>
      <header className={'cabecera' + (elevada ? ' elevada' : '') + (oculta && !abierto && !menu ? ' oculta' : '')}>
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
              <NavLink to="/ordenadores" className={clase}>Ordenadores</NavLink>
              <NavLink to="/tablets" className={clase}>Tablets</NavLink>
              <NavLink to="/gaming" className={clase}>Gaming</NavLink>
              <NavLink to="/tiendas" className={clase}>Tiendas</NavLink>
              <NavLink to="/soporte" className={clase}>Soporte{sinLeer > 0 && !esAdmin && <span key={sinLeer} className="insignia" aria-label={`${sinLeer} mensajes sin leer`}>{sinLeer}</span>}</NavLink>
            </nav>
          )}
          <div className="acciones-cab">
            {usuario ? (
              <>
                <form className="buscador-cab" role="search" onSubmit={(e) => { e.preventDefault(); const q = texto.trim(); if (q) navegar('/buscar?q=' + encodeURIComponent(q)); }}>
                  <input type="search" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar en Jokoa" aria-label="Buscar en toda la tienda" />
                </form>
                <Link to="/carrito" className="carrito-btn" aria-label={`Carrito, ${unidades} unidades`}>
                  <Icon nombre="carrito" tam={26} />
                  {unidades > 0 && <span key={unidades} className="num">{unidades}</span>}
                </Link>
                <div className="usuario-menu" onClick={(e) => e.stopPropagation()}>
                  <button className="usuario-btn" type="button" aria-expanded={menu} onClick={() => setMenu(!menu)}>
                    <span className="avatar">{usuario.nombre.charAt(0).toUpperCase()}</span>
                    <span className="nombre">{usuario.nombre}</span>
                    {esAdmin && sinLeer > 0 && <span key={sinLeer} className="insignia punto-menu" aria-label={`${sinLeer} mensajes sin leer`}>{sinLeer}</span>}
                  </button>
                  {menu && (
                    <div className="desplegable">
                      <div className="quien">
                        <b>{usuario.nombre} {usuario.apellidos}</b>
                        <span>{usuario.email}</span>
                      </div>
                      <Link to="/pedidos"><Icon nombre="carrito" tam={20} />Mis pedidos</Link>
                      <Link to="/favoritos"><Icon nombre="corazonBorde" tam={20} />Mis favoritos</Link>
                      <Link to="/perfil"><Icon nombre="usuario" tam={20} />Mi perfil</Link>
                      {esAdmin && <Link to="/admin/tickets"><Icon nombre="panel" tam={20} />Administración{sinLeer > 0 && <span className="insignia">{sinLeer}</span>}</Link>}
                      <button type="button" onClick={() => setTema(cambiarTema())}>
                        <Icon nombre="panel" tam={20} />{tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}
                      </button>
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
        <div key={pathname} className="pag-anim">
          <Outlet />
        </div>
      </main>
      {usuario && comparados.length > 0 && pathname !== '/comparar' && (
        <div className="barra-comparar" role="region" aria-label="Comparador">
          <span>{comparados.length} {comparados.length === 1 ? 'producto' : 'productos'} para comparar</span>
          <button className="btn pequeno" type="button" disabled={comparados.length < 2} onClick={() => navegar('/comparar')}>Comparar</button>
          <button className="icono-btn" type="button" aria-label="Vaciar la comparación" onClick={vaciarComparados}><Icon nombre="cerrar" tam={20} /></button>
        </div>
      )}
      {usuario && !esAdmin && <AsistenteChat />}
      {!esAdmin && pathname !== '/soporte' && pathname !== '/login' && pathname !== '/registro' && (
        <Link to="/soporte" className={'ayuda-fab' + (usuario ? ' sobre-asesor' : '')} aria-label="Ayuda y soporte">
          <Icon nombre="auricular" tam={22} /><span>¿Ayuda?</span>
        </Link>
      )}
      <footer className="pie">
        <div className="contenedor">
          <span className="marca"><img src="/logo.svg" alt="" />Jokoa</span>
          <span>by Jokoa · Tienda de videojuegos y móviles en Bizkaia</span>
          <Link to="/soporte">¿Algún problema? Soporte</Link>
        </div>
      </footer>
    </>
  );
}
