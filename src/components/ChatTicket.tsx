import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import { fechaCorta } from '../format';
import { useNotif } from '../notificaciones';
import { useToast } from '../toast';
import type { Mensaje, Ticket } from '../types';
import Icon from './Icon';
import Modal from './Modal';

const ESTADOS: Record<Ticket['estado'], string> = { abierto: 'Abierto', en_proceso: 'En curso', cerrado: 'Cerrado' };

// Conversación de un ticket: el cliente y los administradores se escriben como en un chat
export default function ChatTicket({ ticket, onClose, onCambio }: { ticket: Ticket; onClose: () => void; onCambio?: () => void }) {
  const { usuario, esAdmin } = useAuth();
  const [mensajes, setMensajes] = useState<Mensaje[] | null>(null);
  const [estado, setEstado] = useState(ticket.estado);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const fin = useRef<HTMLDivElement>(null);
  const aviso = useToast();
  const { refrescar } = useNotif();

  const cargar = useCallback(async () => {
    try {
      setMensajes(await api.get<Mensaje[]>(`/tickets/${ticket.id}/mensajes`));
      refrescar(); // al abrir la conversación el servidor la marca como leída: el contador baja
    } catch {
      /* se vuelve a intentar en el siguiente ciclo */
    }
  }, [ticket.id, refrescar]);

  // Se actualiza cada pocos segundos mientras la conversación está abierta
  useEffect(() => {
    cargar();
    const ciclo = setInterval(cargar, 5000);
    return () => clearInterval(ciclo);
  }, [cargar]);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [mensajes?.length]);

  const enviar = async () => {
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    setEnviando(true);
    try {
      await api.post(`/tickets/${ticket.id}/mensajes`, { texto: limpio });
      setTexto('');
      if (esAdmin && estado === 'abierto') setEstado('en_proceso');
      await cargar();
      onCambio?.();
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo enviar el mensaje');
    } finally {
      setEnviando(false);
    }
  };

  const alTeclear = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  const cambiarEstado = async (nuevo: Ticket['estado']) => {
    try {
      await api.put(`/tickets/update/${ticket.id}`, { departamento_id: ticket.departamento_id, asunto: ticket.asunto, descripcion: ticket.descripcion, dispositivo: ticket.dispositivo, estado: nuevo });
      setEstado(nuevo);
      aviso('Estado actualizado');
      onCambio?.();
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo cambiar el estado');
    }
  };

  const cerrado = estado === 'cerrado';
  // Lo que escribió el cliente al abrir el ticket es el primer mensaje
  const primero: Mensaje = { id: 0, usuario_id: ticket.usuario_id, autor: ticket.usuario ?? 'Cliente', es_admin: false, texto: ticket.descripcion, fecha: ticket.fecha_apertura };
  const todos = [primero, ...(mensajes ?? [])];

  return (
    <Modal titulo={ticket.asunto} onClose={onClose} ancho>
      <div className="chat">
        <div className="chat-cab">
          <span className="secundario">{ticket.departamento} · {ticket.dispositivo}{esAdmin && ticket.usuario ? ` · ${ticket.usuario}` : ''}</span>
          {esAdmin ? (
            <select value={estado} onChange={(e) => cambiarEstado(e.target.value as Ticket['estado'])} aria-label="Estado del ticket">
              {Object.entries(ESTADOS).map(([v, t]) => (
                <option key={v} value={v}>{t}</option>
              ))}
            </select>
          ) : (
            <span className={'chip' + (cerrado ? ' exito' : estado === 'abierto' ? ' coral' : '')}>{ESTADOS[estado]}</span>
          )}
        </div>
        <div className="chat-lista" role="log" aria-live="polite">
          {todos.map((m) => {
            const propio = m.usuario_id === usuario?.id;
            return (
              <div key={m.id} className={'burbuja-fila' + (propio ? ' propia' : '')}>
                <div className={'burbuja' + (m.es_admin ? ' soporte' : '')}>
                  <div className="quien">
                    {m.es_admin ? 'Soporte Jokoa' : propio ? 'Tú' : m.autor}
                    {m.es_admin && <span className="etiqueta-soporte">Equipo</span>}
                  </div>
                  <div className="texto">{m.texto}</div>
                  <div className="hora">{fechaCorta(m.fecha)} {m.fecha.substring(11, 16)}</div>
                </div>
              </div>
            );
          })}
          {mensajes === null && <div className="nota" style={{ textAlign: 'center' }}>Cargando la conversación…</div>}
          <div ref={fin} />
        </div>
        {cerrado ? (
          <div className="chat-cerrado"><Icon nombre="check" tam={18} />Este ticket está cerrado{esAdmin ? ': cámbiale el estado para volver a escribir.' : '. Si necesitas algo más, abre un ticket nuevo.'}</div>
        ) : (
          <div className="chat-entrada">
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={alTeclear} placeholder={esAdmin ? 'Escribe tu respuesta al cliente…' : 'Escribe un mensaje a soporte…'} rows={2} maxLength={1000} aria-label="Mensaje" />
            <button className="btn" type="button" disabled={!texto.trim() || enviando} onClick={enviar} aria-label="Enviar mensaje">
              <Icon nombre="enviar" tam={20} />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
