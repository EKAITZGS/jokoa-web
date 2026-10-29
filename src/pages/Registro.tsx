import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import { Campo } from '../components/Campos';
import { useToast } from '../toast';

export default function Registro() {
  const { usuario, entrar } = useAuth();
  const [d, setD] = useState({ nombre: '', apellidos: '', telefono: '', email: '', password: '' });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState(false);
  const navegar = useNavigate();
  const aviso = useToast();

  if (usuario) return <Navigate to="/juegos" replace />;
  const poner = (k: keyof typeof d) => (v: string) => setD({ ...d, [k]: v });

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!d.nombre.trim()) er.nombre = 'Escribe tu nombre';
    if (!d.apellidos.trim()) er.apellidos = 'Escribe tus apellidos';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim())) er.email = 'Email no válido';
    if (d.password.length < 6) er.password = 'Escribe al menos 6 caracteres';
    setErrores(er);
    if (Object.keys(er).length) return;
    setOcupado(true);
    try {
      await api.post('/registro', { ...d, nombre: d.nombre.trim(), apellidos: d.apellidos.trim(), telefono: d.telefono.trim(), email: d.email.trim() });
      await entrar(d.email.trim(), d.password);
      aviso('¡Bienvenido a Jokoa!');
      navegar('/juegos', { replace: true });
    } catch (err) {
      setErrores({ general: err instanceof ApiError ? err.message : 'No se pudo crear la cuenta' });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="acceso">
      <span className="deco" style={{ top: -30, left: '12%', width: 110, height: 110 }} />
      <span className="deco" style={{ top: -40, right: '8%', width: 130, height: 130 }} />
      <span className="deco cl" style={{ top: '22%', left: '9%', width: 48, height: 48 }} />
      <span className="deco cl" style={{ top: '30%', right: '12%', width: 34, height: 34 }} />
      <span className="deco" style={{ bottom: -20, left: -20, width: 130, height: 110 }} />
      <span className="deco" style={{ bottom: -30, right: '10%', width: 120, height: 110 }} />
      <span className="deco co" style={{ bottom: '18%', left: '14%', width: 40, height: 40 }} />
      <div className="tarjeta acceso-caja" style={{ width: 'min(500px, 100%)' }}>
        <div className="logo">
          <img src="/logo.svg" alt="Logo de Jokoa" />
          <h1>Crear cuenta</h1>
          <p>Únete a Jokoa, jokalari</p>
        </div>
        <form className="formulario" onSubmit={enviar} noValidate>
          <div className="fila-campos">
            <Campo etiqueta="Nombre" value={d.nombre} onChange={poner('nombre')} error={errores.nombre} autoComplete="given-name" />
            <Campo etiqueta="Apellidos" value={d.apellidos} onChange={poner('apellidos')} error={errores.apellidos} autoComplete="family-name" />
          </div>
          <Campo etiqueta="Teléfono (opcional)" type="tel" value={d.telefono} onChange={poner('telefono')} autoComplete="tel" />
          <Campo etiqueta="Email" type="email" value={d.email} onChange={poner('email')} error={errores.email} autoComplete="email" />
          <Campo etiqueta="Contraseña (mínimo 6)" type="password" value={d.password} onChange={poner('password')} error={errores.password} autoComplete="new-password" />
          {errores.general && <div className="error-texto">{errores.general}</div>}
          <button className="btn grande bloque" type="submit" disabled={ocupado}>Crear cuenta</button>
        </form>
        <Link className="enlace" to="/login">Ya tengo cuenta</Link>
      </div>
    </div>
  );
}
