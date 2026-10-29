import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../api';
import Icon from '../components/Icon';

// Destino del enlace del correo: /verificar?email=...&token=...
export default function Verificar() {
  const [params] = useSearchParams();
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const email = params.get('email') ?? '';
    const token = params.get('token') ?? '';
    if (!email || !token) {
      setEstado('error');
      setMensaje('El enlace está incompleto.');
      return;
    }
    api
      .post('/verificar', { email, token })
      .then(() => setEstado('ok'))
      .catch((e) => {
        setEstado('error');
        setMensaje(e instanceof ApiError ? e.message : 'No se pudo conectar con el servidor');
      });
  }, [params]);

  return (
    <div className="acceso">
      <div className="tarjeta acceso-caja" style={{ textAlign: 'center' }}>
        <div className="estado-centro" style={{ padding: '8px 0 0' }}>
          <div className="circulo" style={estado === 'error' ? { background: 'var(--coral-tenue)', color: 'var(--coral-oscuro)' } : undefined}>
            <Icon nombre={estado === 'error' ? 'cerrar' : 'check'} tam={40} />
          </div>
          {estado === 'cargando' && <h1 style={{ fontSize: 24 }}>Verificando tu cuenta…</h1>}
          {estado === 'ok' && (
            <>
              <h1 style={{ fontSize: 26 }}>¡Cuenta verificada!</h1>
              <p>Ya puedes entrar con tu email y tu contraseña.</p>
            </>
          )}
          {estado === 'error' && (
            <>
              <h1 style={{ fontSize: 24 }}>No se pudo verificar</h1>
              <p>{mensaje}</p>
            </>
          )}
        </div>
        {estado !== 'cargando' && <Link className="btn grande bloque" style={{ marginTop: 20 }} to="/login">Ir a entrar</Link>}
      </div>
    </div>
  );
}
