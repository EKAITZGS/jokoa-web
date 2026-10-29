import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import { Campo, Selector } from '../components/Campos';
import { Barra, ErrorEstado } from '../components/Estados';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { fechaCorta } from '../format';
import { useToast } from '../toast';
import type { UsuarioAdmin } from '../types';

const VACIO = { email: '', nombre: '', apellidos: '', telefono: '', rol: 'usuario', activo: true, password: '' };

export default function UsuariosAdmin() {
  const { usuario: yo } = useAuth();
  const [lista, setLista] = useState<UsuarioAdmin[] | null>(null);
  const [error, setError] = useState(false);
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState<UsuarioAdmin | 'nuevo' | null>(null);
  const [f, setF] = useState(VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState(false);
  const aviso = useToast();

  const cargar = useCallback(async () => {
    setError(false);
    try {
      setLista(await api.get<UsuarioAdmin[]>('/admin/usuarios'));
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return (lista ?? []).filter((u) => !t || `${u.nombre} ${u.apellidos} ${u.email}`.toLowerCase().includes(t));
  }, [lista, busca]);

  const abrir = (u: UsuarioAdmin | 'nuevo') => {
    setErrores({});
    setEditando(u);
    setF(u === 'nuevo' ? VACIO : { email: u.email, nombre: u.nombre, apellidos: u.apellidos, telefono: u.telefono ?? '', rol: u.rol, activo: u.activo, password: '' });
  };
  const poner = (k: keyof typeof VACIO) => (v: string) => setF({ ...f, [k]: v });

  const guardar = async () => {
    const er: Record<string, string> = {};
    const nuevo = editando === 'nuevo';
    if (nuevo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) er.email = 'Email no válido';
    if (!f.nombre.trim()) er.nombre = 'Escribe el nombre';
    if (!f.apellidos.trim()) er.apellidos = 'Escribe los apellidos';
    if (nuevo && f.password.length < 6) er.password = 'Al menos 6 caracteres';
    if (!nuevo && f.password && f.password.length < 6) er.password = 'Al menos 6 caracteres';
    setErrores(er);
    if (Object.keys(er).length) return;
    setOcupado(true);
    try {
      const cuerpo = { nombre: f.nombre.trim(), apellidos: f.apellidos.trim(), telefono: f.telefono.trim(), rol: f.rol, activo: f.activo, ...(f.password ? { password: f.password } : {}) };
      if (nuevo) await api.post('/admin/usuarios/add', { ...cuerpo, email: f.email.trim() });
      else await api.put(`/admin/usuarios/update/${(editando as UsuarioAdmin).id}`, cuerpo);
      aviso(nuevo ? 'Usuario creado' : 'Usuario actualizado');
      setEditando(null);
      cargar();
    } catch (e) {
      setErrores({ general: e instanceof ApiError ? e.message : 'No se pudo guardar' });
    } finally {
      setOcupado(false);
    }
  };

  const cambiarActivo = async (u: UsuarioAdmin) => {
    try {
      await api.put(`/admin/usuarios/update/${u.id}`, { nombre: u.nombre, apellidos: u.apellidos, telefono: u.telefono ?? '', rol: u.rol, activo: !u.activo });
      aviso(u.activo ? 'Usuario desactivado' : 'Usuario activado');
      cargar();
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo cambiar el estado');
    }
  };

  const esYo = (u: UsuarioAdmin) => u.id === yo?.id;

  return (
    <>
      <Barra cargando={lista === null && !error} />
      <div className="admin-cab" style={{ marginTop: 8 }}>
        <div>
          <h1>Usuarios</h1>
          <p>Altas, roles y acceso. Un usuario desactivado no puede entrar, pero conserva sus pedidos.</p>
        </div>
        <button className="btn grande" type="button" onClick={() => abrir('nuevo')}><Icon nombre="mas" />Nuevo usuario</button>
      </div>
      <div className="barra-herr">
        <Campo etiqueta="Buscar por nombre o email" value={busca} onChange={setBusca} />
      </div>
      {error ? (
        <ErrorEstado onReintentar={cargar} />
      ) : (
        <div className="tarjeta panel">
          <div className="tabla-caja">
            <table className="tabla">
              <thead><tr><th>Usuario</th><th>Teléfono</th><th>Rol</th><th>Estado</th><th>Alta</th><th /></tr></thead>
              <tbody>
                {visibles.map((u) => (
                  <tr key={u.id}>
                    <td><div className="principal">{u.nombre} {u.apellidos}{esYo(u) && ' (tú)'}</div><div className="secundario">{u.email}</div></td>
                    <td>{u.telefono ?? '—'}</td>
                    <td><span className={'chip' + (u.rol === 'admin' ? ' contorno' : '')}>{u.rol === 'admin' ? 'Administrador' : 'Usuario'}</span></td>
                    <td>{u.activo ? <span className="chip exito"><Icon nombre="check" tam={14} />Activo</span> : <span className="chip gris">Desactivado</span>}</td>
                    <td>{fechaCorta(u.fecha_alta)}</td>
                    <td>
                      <div className="acciones">
                        <button className="icono-btn" type="button" aria-label={`Editar a ${u.nombre}`} onClick={() => abrir(u)}><Icon nombre="editar" /></button>
                        <button className={'btn pequeno ' + (u.activo ? 'contorno' : 'tonal')} type="button" disabled={esYo(u)} title={esYo(u) ? 'No puedes desactivarte a ti mismo' : undefined} onClick={() => cambiarActivo(u)}>
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lista && visibles.length === 0 && <div className="vacio-tabla">No hay usuarios con ese filtro.</div>}
          </div>
        </div>
      )}
      {editando && (
        <Modal
          titulo={editando === 'nuevo' ? 'Nuevo usuario' : 'Editar usuario'}
          onClose={() => setEditando(null)}
          pie={
            <>
              <button className="btn fantasma" type="button" onClick={() => setEditando(null)}>Cancelar</button>
              <button className="btn" type="button" disabled={ocupado} onClick={guardar}>Guardar</button>
            </>
          }
        >
          <div className="formulario">
            <Campo etiqueta="Email" type="email" value={f.email} onChange={poner('email')} error={errores.email} disabled={editando !== 'nuevo'} />
            <div className="fila-campos">
              <Campo etiqueta="Nombre" value={f.nombre} onChange={poner('nombre')} error={errores.nombre} />
              <Campo etiqueta="Apellidos" value={f.apellidos} onChange={poner('apellidos')} error={errores.apellidos} />
            </div>
            <Campo etiqueta="Teléfono" type="tel" value={f.telefono} onChange={poner('telefono')} />
            <Selector etiqueta="Rol" value={f.rol} onChange={poner('rol')}>
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </Selector>
            <Campo etiqueta={editando === 'nuevo' ? 'Contraseña (mínimo 6)' : 'Nueva contraseña (vacío = no cambiar)'} type="password" value={f.password} onChange={poner('password')} error={errores.password} autoComplete="new-password" />
            {editando !== 'nuevo' && (
              <label className="casilla">
                <input type="checkbox" checked={f.activo} onChange={(e) => setF({ ...f, activo: e.target.checked })} disabled={esYo(editando)} />
                Cuenta activa
              </label>
            )}
            {errores.general && <div className="error-texto">{errores.general}</div>}
          </div>
        </Modal>
      )}
    </>
  );
}
