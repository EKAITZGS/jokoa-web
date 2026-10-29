import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { Barra, ErrorEstado } from '../components/Estados';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { fechaCorta } from '../format';
import { EstadoTicket } from '../pages/Soporte';
import { useToast } from '../toast';
import type { Ticket } from '../types';

export default function TicketsAdmin() {
  const [lista, setLista] = useState<Ticket[] | null>(null);
  const [error, setError] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [ver, setVer] = useState<Ticket | null>(null);
  const [borrando, setBorrando] = useState<Ticket | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const aviso = useToast();

  const cargar = useCallback(async () => {
    setError(false);
    try {
      setLista(await api.get<Ticket[]>('/tickets'));
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiarEstado = async (t: Ticket, estado: Ticket['estado']) => {
    try {
      await api.put(`/tickets/update/${t.id}`, { departamento_id: t.departamento_id, asunto: t.asunto, descripcion: t.descripcion, dispositivo: t.dispositivo, estado });
      aviso('Estado actualizado');
      cargar();
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo cambiar el estado');
    }
  };

  const borrar = async () => {
    if (!borrando) return;
    setOcupado(true);
    try {
      await api.borrar(`/tickets/delete/${borrando.id}`);
      aviso('Ticket eliminado');
      cargar();
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo eliminar');
    } finally {
      setOcupado(false);
      setBorrando(null);
    }
  };

  const visibles = (lista ?? []).filter((t) => !filtro || t.estado === filtro);

  return (
    <>
      <Barra cargando={lista === null && !error} />
      <div className="admin-cab" style={{ marginTop: 8 }}>
        <div>
          <h1>Tickets de soporte</h1>
          <p>Cambia el estado según avance la incidencia.</p>
        </div>
      </div>
      <div className="pestanas" role="tablist" style={{ marginBottom: 16 }}>
        {[['', 'Todos'], ['abierto', 'Abiertos'], ['en_proceso', 'En curso'], ['cerrado', 'Cerrados']].map(([v, t]) => (
          <button key={v} type="button" role="tab" aria-selected={filtro === v} className={filtro === v ? 'activa' : ''} onClick={() => setFiltro(v)}>{t}</button>
        ))}
      </div>
      {error ? (
        <ErrorEstado onReintentar={cargar} />
      ) : (
        <div className="tarjeta panel">
          <div className="tabla-caja">
            <table className="tabla">
              <thead><tr><th>Ticket</th><th>Cliente</th><th>Departamento</th><th>Estado</th><th>Abierto</th><th /></tr></thead>
              <tbody>
                {visibles.map((t) => (
                  <tr key={t.id}>
                    <td><div className="principal">{t.asunto}</div><div className="secundario">{t.dispositivo}</div></td>
                    <td>{t.usuario ?? `Usuario ${t.usuario_id}`}</td>
                    <td>{t.departamento}</td>
                    <td>
                      <select value={t.estado} onChange={(e) => cambiarEstado(t, e.target.value as Ticket['estado'])} aria-label={`Estado de ${t.asunto}`}>
                        <option value="abierto">Abierto</option>
                        <option value="en_proceso">En curso</option>
                        <option value="cerrado">Cerrado</option>
                      </select>
                    </td>
                    <td>{fechaCorta(t.fecha_apertura)}</td>
                    <td>
                      <div className="acciones">
                        <button className="icono-btn" type="button" aria-label={`Ver ${t.asunto}`} onClick={() => setVer(t)}><Icon nombre="ojo" /></button>
                        <button className="icono-btn peligro" type="button" aria-label={`Eliminar ${t.asunto}`} onClick={() => setBorrando(t)}><Icon nombre="basura" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lista && visibles.length === 0 && <div className="vacio-tabla">No hay tickets.</div>}
          </div>
        </div>
      )}
      {ver && (
        <Modal titulo={ver.asunto} onClose={() => setVer(null)} pie={<button className="btn" type="button" onClick={() => setVer(null)}>Cerrar</button>}>
          <div style={{ display: 'grid', gap: 10 }}>
            <div><EstadoTicket estado={ver.estado} /></div>
            <div className="secundario"><b>{ver.departamento}</b> · {ver.dispositivo} · {ver.usuario}</div>
            <p style={{ whiteSpace: 'pre-line' }}>{ver.descripcion}</p>
            <div className="nota">Abierto el {fechaCorta(ver.fecha_apertura)}{ver.fecha_cierre ? ` · cerrado el ${fechaCorta(ver.fecha_cierre)}` : ''}</div>
          </div>
        </Modal>
      )}
      {borrando && (
        <Modal
          estrecho
          titulo="¿Eliminar ticket?"
          onClose={() => setBorrando(null)}
          pie={
            <>
              <button className="btn fantasma" type="button" onClick={() => setBorrando(null)}>Cancelar</button>
              <button className="btn coral" type="button" disabled={ocupado} onClick={borrar}>Eliminar</button>
            </>
          }
        >
          <p>Se eliminará el ticket «{borrando.asunto}». No se puede deshacer.</p>
        </Modal>
      )}
    </>
  );
}
