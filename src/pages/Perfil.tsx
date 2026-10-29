import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import { Campo } from '../components/Campos';
import Icon from '../components/Icon';
import { useToast } from '../toast';

export default function Perfil() {
  const { usuario, refrescar } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [apellidos, setApellidos] = useState(usuario?.apellidos ?? '');
  const [telefono, setTelefono] = useState(usuario?.telefono ?? '');
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState(false);
  const aviso = useToast();

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!nombre.trim()) er.nombre = 'Escribe tu nombre';
    if (!apellidos.trim()) er.apellidos = 'Escribe tus apellidos';
    const cambia = !!(actual || nueva);
    if (cambia && !actual) er.actual = 'Escribe la contraseña actual';
    if (cambia && nueva.length < 6) er.nueva = 'Escribe al menos 6 caracteres';
    setErrores(er);
    if (Object.keys(er).length) return;
    setOcupado(true);
    try {
      const cuerpo: Record<string, string> = { nombre: nombre.trim(), apellidos: apellidos.trim(), telefono: telefono.trim() };
      if (cambia) {
        cuerpo.password_actual = actual;
        cuerpo.password_nueva = nueva;
      }
      await api.put('/perfil/update', cuerpo);
      await refrescar();
      setActual('');
      setNueva('');
      aviso('Perfil guardado');
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo guardar el perfil');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="contenedor pagina">
      <div className="tarjeta perfil-caja">
        <div className="pagina-cab" style={{ marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 28 }}>Tu perfil</h1>
            <p style={{ color: 'var(--azul)' }}>{usuario?.email}</p>
          </div>
        </div>
        <Link className="btn coral bloque grande" to="/soporte"><Icon nombre="auricular" />Soporte técnico</Link>
        <form className="formulario" style={{ marginTop: 20 }} onSubmit={guardar} noValidate>
          <Campo etiqueta="Nombre" value={nombre} onChange={setNombre} error={errores.nombre} autoComplete="given-name" />
          <Campo etiqueta="Apellidos" value={apellidos} onChange={setApellidos} error={errores.apellidos} autoComplete="family-name" />
          <Campo etiqueta="Teléfono" value={telefono} onChange={setTelefono} type="tel" autoComplete="tel" />
          <h2>Cambiar contraseña (opcional)</h2>
          <Campo etiqueta="Contraseña actual" value={actual} onChange={setActual} type="password" error={errores.actual} autoComplete="current-password" />
          <Campo etiqueta="Contraseña nueva" value={nueva} onChange={setNueva} type="password" error={errores.nueva} autoComplete="new-password" />
          <button className="btn grande bloque" type="submit" disabled={ocupado}>Guardar cambios</button>
        </form>
      </div>
    </div>
  );
}
