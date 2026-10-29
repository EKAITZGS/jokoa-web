import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import Icon from '../components/Icon';

const enlaces = [
  { a: '/admin', t: 'Resumen', i: 'grafica', fin: true },
  { a: '/admin/usuarios', t: 'Usuarios', i: 'grupo' },
  { a: '/admin/productos', t: 'Productos', i: 'caja' },
  { a: '/admin/pedidos', t: 'Pedidos', i: 'bolsa' },
  { a: '/admin/tickets', t: 'Tickets', i: 'ticket' },
  { a: '/admin/tiendas', t: 'Tiendas', i: 'tienda' },
];

export default function AdminLayout() {
  const { salir } = useAuth();
  const navegar = useNavigate();
  return (
    <div className="admin">
      <aside className="admin-lateral">
        <Link to="/admin" className="marca">
          <img src="/logo.svg" alt="" />
          <span>
            Jokoa
            <small>Administración</small>
          </span>
        </Link>
        <nav aria-label="Administración" style={{ display: 'contents' }}>
          {enlaces.map((e) => (
            <NavLink key={e.a} to={e.a} end={e.fin} className={({ isActive }) => (isActive ? 'activo' : undefined)}>
              <Icon nombre={e.i} />
              <span>{e.t}</span>
            </NavLink>
          ))}
        </nav>
        <div className="abajo">
          <Link to="/juegos" style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, padding: '0 14px', borderRadius: 12, fontWeight: 700, color: 'var(--texto-2)' }}>
            <Icon nombre="atras" />
            <span>Volver a la tienda</span>
          </Link>
          <button type="button" onClick={() => { salir(); navegar('/'); }}>
            <Icon nombre="cerrar" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
      <main className="admin-principal">
        <Outlet />
      </main>
    </div>
  );
}
