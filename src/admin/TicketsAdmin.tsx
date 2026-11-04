import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { Barra, ErrorEstado } from '../components/Estados';
import Icon from '../components/Icon';
import ChatTicket from '../components/ChatTicket';
import Modal from '../components/Modal';
import { ESTADOS_TICKET, ETIQUETA_ESTADO, fechaCorta } from '../format';
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

  const cambiarEstado = async (t: Ticket, estado: Ticket['estado'], presupuesto: number | null = t.presupuesto) => {
    try {
      await api.put(`/tickets/update/${t.id}`, { departamento_id: t.departamento_id, asunto: t.asunto, descripcion: t.descripcion, dispositivo: t.dispositivo, estado, presupuesto });
      aviso('Estado actualizado');
      cargar();
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo cambiar el estado');
    }
  };

  // Presupuesto que el administrador escribe para cada reparación antes de enviarlo al cliente
  const [presupuestos, setPresupuestos] = useState<Record<number, string>>({});
  const enviarPresupuesto = (t: Ticket) => {
    const valor = Number(presupuestos[t.id] ?? t.presupuesto ?? '');
    if (!Number.isFinite(valor) || valor <= 0) return aviso('Escribe un presupuesto mayor que 0');
    cambiarEstado(t, 'presupuestado', valor);
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

  const visibles = (lista ?? []).filter((t) => !filtro || (filtro === 'reparacion' ? t.tipo === 'reparacion' : t.estado === filtro));

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
        {[['', 'Todos'], ['reparacion', 'Reparaciones'], ['abierto', 'Abiertos'], ['en_proceso', 'En curso'], ['cerrado', 'Cerrados']].map(([v, t]) => (
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
                  <tr key={t.id} className={t.no_leidos > 0 ? 'fila-nueva' : undefined}>
                    <td><div className="principal">{t.asunto}{t.no_leidos > 0 && <span className="chip coral" style={{ marginLeft: 8 }}>Nuevo</span>}</div><div className="secundario">{t.dispositivo}</div></td>
                    <td>{t.usuario ?? `Usuario ${t.usuario_id}`}</td>
                    <td>{t.departamento}</td>
                    <td>
                      <select value={t.estado} onChange={(e) => cambiarEstado(t, e.target.value as Ticket['estado'])} aria-label={`Estado de ${t.asunto}`}>
                        {ESTADOS_TICKET[t.tipo].map((e) => <option key={e} value={e}>{ETIQUETA_ESTADO[e]}</option>)}
                      </select>
                      {t.tipo === 'reparacion' && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input type="number" min="0" step="0.01" style={{ width: 96 }} placeholder="€" aria-label={`Presupuesto de ${t.asunto}`} value={presupuestos[t.id] ?? t.presupuesto ?? ''} onChange={(e) => setPresupuestos({ ...presupuestos, [t.id]: e.target.value })} />
                            <button className="btn pequeno tonal" type="button" disabled={t.estado === 'cerrado' || t.estado === 'listo'} onClick={() => enviarPresupuesto(t)}>Enviar presupuesto</button>
                          </div>
                          {t.presupuesto !== null && <div className="secundario">{t.presupuesto_aceptado === true ? 'Aceptado por el cliente' : t.presupuesto_aceptado === false ? 'Rechazado por el cliente' : 'Esperando respuesta del cliente'}</div>}
                        </div>
                      )}
                    </td>
                    <td>{fechaCorta(t.fecha_apertura)}</td>
                    <td>
                      <div className="acciones">
                        <button className={'btn pequeno ' + (t.no_leidos > 0 ? 'coral' : 'tonal')} type="button" aria-label={`Responder ${t.asunto}`} onClick={() => setVer(t)}><Icon nombre="chat" tam={18} />{t.no_leidos > 0 ? `Responder (${t.no_leidos})` : 'Responder'}</button>
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
      {ver && <ChatTicket ticket={ver} onClose={() => { setVer(null); cargar(); }} onCambio={cargar} />}
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
