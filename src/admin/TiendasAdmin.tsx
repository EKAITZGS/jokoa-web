import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { Campo } from '../components/Campos';
import { Barra, ErrorEstado } from '../components/Estados';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { useToast } from '../toast';
import type { Tienda } from '../types';

const VACIA = { nombre: '', direccion: '', telefono: '', horario: '', latitud: '', longitud: '' };

export default function TiendasAdmin() {
  const [lista, setLista] = useState<Tienda[] | null>(null);
  const [error, setError] = useState(false);
  const [editando, setEditando] = useState<Tienda | 'nueva' | null>(null);
  const [borrando, setBorrando] = useState<Tienda | null>(null);
  const [f, setF] = useState(VACIA);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState(false);
  const aviso = useToast();

  const cargar = useCallback(async () => {
    setError(false);
    try {
      setLista(await api.get<Tienda[]>('/tiendas'));
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrir = (t: Tienda | 'nueva') => {
    setErrores({});
    setEditando(t);
    setF(t === 'nueva' ? VACIA : { nombre: t.nombre, direccion: t.direccion, telefono: t.telefono, horario: t.horario, latitud: String(t.latitud), longitud: String(t.longitud) });
  };
  const poner = (k: keyof typeof VACIA) => (v: string) => setF({ ...f, [k]: v });
  const num = (v: string) => Number(v.replace(',', '.'));

  const guardar = async () => {
    const er: Record<string, string> = {};
    (['nombre', 'direccion', 'telefono', 'horario'] as const).forEach((k) => {
      if (!f[k].trim()) er[k] = 'Obligatorio';
    });
    if (f.latitud === '' || !(Math.abs(num(f.latitud)) <= 90)) er.latitud = 'Entre -90 y 90';
    if (f.longitud === '' || !(Math.abs(num(f.longitud)) <= 180)) er.longitud = 'Entre -180 y 180';
    setErrores(er);
    if (Object.keys(er).length) return;
    const cuerpo = { nombre: f.nombre.trim(), direccion: f.direccion.trim(), telefono: f.telefono.trim(), horario: f.horario.trim(), latitud: num(f.latitud), longitud: num(f.longitud) };
    setOcupado(true);
    try {
      if (editando === 'nueva') await api.post('/admin/tiendas/add', cuerpo);
      else await api.put(`/admin/tiendas/update/${(editando as Tienda).id}`, cuerpo);
      aviso(editando === 'nueva' ? 'Tienda añadida' : 'Tienda actualizada');
      setEditando(null);
      cargar();
    } catch (e) {
      setErrores({ general: e instanceof ApiError ? e.message : 'No se pudo guardar' });
    } finally {
      setOcupado(false);
    }
  };

  const borrar = async () => {
    if (!borrando) return;
    setOcupado(true);
    try {
      await api.borrar(`/admin/tiendas/delete/${borrando.id}`);
      aviso('Tienda eliminada');
      cargar();
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo eliminar');
    } finally {
      setOcupado(false);
      setBorrando(null);
    }
  };

  return (
    <>
      <Barra cargando={lista === null && !error} />
      <div className="admin-cab" style={{ marginTop: 8 }}>
        <div>
          <h1>Tiendas</h1>
          <p>Las tiendas que salen en el mapa de la web y de las apps.</p>
        </div>
        <button className="btn grande" type="button" onClick={() => abrir('nueva')}><Icon nombre="mas" />Nueva tienda</button>
      </div>
      {error ? (
        <ErrorEstado onReintentar={cargar} />
      ) : (
        <div className="tarjeta panel">
          <div className="tabla-caja">
            <table className="tabla">
              <thead><tr><th>Tienda</th><th>Horario</th><th>Teléfono</th><th>Coordenadas</th><th /></tr></thead>
              <tbody>
                {(lista ?? []).map((t) => (
                  <tr key={t.id}>
                    <td><div className="principal">{t.nombre}</div><div className="secundario">{t.direccion}</div></td>
                    <td>{t.horario}</td>
                    <td>{t.telefono}</td>
                    <td className="secundario">{t.latitud}, {t.longitud}</td>
                    <td>
                      <div className="acciones">
                        <button className="icono-btn" type="button" aria-label={`Editar ${t.nombre}`} onClick={() => abrir(t)}><Icon nombre="editar" /></button>
                        <button className="icono-btn peligro" type="button" aria-label={`Eliminar ${t.nombre}`} onClick={() => setBorrando(t)}><Icon nombre="basura" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lista && lista.length === 0 && <div className="vacio-tabla">No hay tiendas.</div>}
          </div>
        </div>
      )}
      {editando && (
        <Modal
          titulo={editando === 'nueva' ? 'Nueva tienda' : 'Editar tienda'}
          onClose={() => setEditando(null)}
          pie={
            <>
              <button className="btn fantasma" type="button" onClick={() => setEditando(null)}>Cancelar</button>
              <button className="btn" type="button" disabled={ocupado} onClick={guardar}>Guardar</button>
            </>
          }
        >
          <div className="formulario">
            <Campo etiqueta="Nombre" value={f.nombre} onChange={poner('nombre')} error={errores.nombre} />
            <Campo etiqueta="Dirección" value={f.direccion} onChange={poner('direccion')} error={errores.direccion} />
            <div className="fila-campos">
              <Campo etiqueta="Teléfono" value={f.telefono} onChange={poner('telefono')} error={errores.telefono} />
              <Campo etiqueta="Horario" value={f.horario} onChange={poner('horario')} error={errores.horario} />
            </div>
            <div className="fila-campos">
              <Campo etiqueta="Latitud" inputMode="decimal" value={f.latitud} onChange={poner('latitud')} error={errores.latitud} />
              <Campo etiqueta="Longitud" inputMode="decimal" value={f.longitud} onChange={poner('longitud')} error={errores.longitud} />
            </div>
            {errores.general && <div className="error-texto">{errores.general}</div>}
          </div>
        </Modal>
      )}
      {borrando && (
        <Modal
          estrecho
          titulo="¿Eliminar tienda?"
          onClose={() => setBorrando(null)}
          pie={
            <>
              <button className="btn fantasma" type="button" onClick={() => setBorrando(null)}>Cancelar</button>
              <button className="btn coral" type="button" disabled={ocupado} onClick={borrar}>Eliminar</button>
            </>
          }
        >
          <p>Se quitará <b>{borrando.nombre}</b> del mapa.</p>
        </Modal>
      )}
    </>
  );
}
