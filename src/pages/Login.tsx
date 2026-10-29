import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../api';
import { useAuth } from '../auth';
import { Campo } from '../components/Campos';

export default function Login() {
  const { usuario, entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState(false);
  const navegar = useNavigate();
  const { state } = useLocation();

  if (usuario) return <Navigate to={state?.desde ?? '/juegos'} replace />;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) er.email = 'Email no válido';
    if (!password) er.password = 'Escribe la contraseña';
    setErrores(er);
    if (Object.keys(er).length) return;
    setOcupado(true);
    try {
      await entrar(email.trim(), password);
      navegar(state?.desde ?? '/juegos', { replace: true });
    } catch (err) {
      const sinRed = err instanceof ApiError && err.status === 0;
      setErrores({ general: sinRed ? 'No se pudo conectar con el servidor' : 'Email o contraseña incorrectos, o la cuenta está desactivada' });
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
      <div className="tarjeta acceso-caja">
        <div className="logo">
          <img src="/logo.svg" alt="Logo de Jokoa" />
          <h1>Jokoa</h1>
          <p>Entra en tu cuenta, jokalari</p>
        </div>
        <form className="formulario" onSubmit={enviar} noValidate>
          <Campo etiqueta="Email" type="email" value={email} onChange={setEmail} error={errores.email} autoComplete="username" />
          <Campo etiqueta="Contraseña" type="password" value={password} onChange={setPassword} error={errores.password} autoComplete="current-password" />
          {errores.general && <div className="error-texto">{errores.general}</div>}
          <button className="btn grande bloque" type="submit" disabled={ocupado}>Entrar</button>
        </form>
        <Link className="enlace" to="/registro">¿No tienes cuenta? Regístrate</Link>
        <Link className="enlace" style={{ marginTop: 0, color: 'var(--texto-2)', fontWeight: 500 }} to="/">Volver al inicio</Link>
      </div>
    </div>
  );
}
