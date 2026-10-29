import { Navigate, Outlet, Route, Routes, useLocation, Link } from 'react-router-dom';
import AdminLayout from './admin/AdminLayout';
import PedidosAdmin from './admin/PedidosAdmin';
import ProductosAdmin from './admin/ProductosAdmin';
import ResumenAdmin from './admin/ResumenAdmin';
import TicketsAdmin from './admin/TicketsAdmin';
import TiendasAdmin from './admin/TiendasAdmin';
import UsuariosAdmin from './admin/UsuariosAdmin';
import { useAuth } from './auth';
import Layout from './components/Layout';
import Carrito from './pages/Carrito';
import Catalogo from './pages/Catalogo';
import Ficha from './pages/Ficha';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Pedidos from './pages/Pedidos';
import Perfil from './pages/Perfil';
import Registro from './pages/Registro';
import Soporte from './pages/Soporte';
import Tiendas from './pages/Tiendas';
import Verificar from './pages/Verificar';

const Cargando = () => (
  <div className="barra-carga" role="progressbar" aria-label="Cargando" />
);

function SoloConSesion() {
  const { usuario, cargando } = useAuth();
  const { pathname } = useLocation();
  if (cargando) return <Cargando />;
  return usuario ? <Outlet /> : <Navigate to="/login" state={{ desde: pathname }} replace />;
}

function SoloAdmin() {
  const { usuario, cargando, esAdmin } = useAuth();
  const { pathname } = useLocation();
  if (cargando) return <Cargando />;
  if (!usuario) return <Navigate to="/login" state={{ desde: pathname }} replace />;
  return esAdmin ? <Outlet /> : <Navigate to="/juegos" replace />;
}

function NoEncontrada() {
  return (
    <div className="contenedor pagina">
      <div className="estado-centro">
        <h1>No encontramos esa página</h1>
        <Link className="btn" to="/">Volver al inicio</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/verificar" element={<Verificar />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Inicio />} />
        <Route element={<SoloConSesion />}>
          <Route path="/juegos" element={<Catalogo tipo="videojuegos" />} />
          <Route path="/moviles" element={<Catalogo tipo="moviles" />} />
          <Route path="/producto/:tipo/:id" element={<Ficha />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/tiendas" element={<Tiendas />} />
          <Route path="/soporte" element={<Soporte />} />
        </Route>
        <Route path="*" element={<NoEncontrada />} />
      </Route>

      <Route element={<SoloAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ResumenAdmin />} />
          <Route path="usuarios" element={<UsuariosAdmin />} />
          <Route path="productos" element={<ProductosAdmin />} />
          <Route path="pedidos" element={<PedidosAdmin />} />
          <Route path="tickets" element={<TicketsAdmin />} />
          <Route path="tiendas" element={<TiendasAdmin />} />
        </Route>
      </Route>
    </Routes>
  );
}
