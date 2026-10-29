import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { AreaTexto, Campo, Selector } from '../components/Campos';
import { Barra, ErrorEstado, Vacio } from '../components/Estados';
import Icon from '../components/Icon';
import ChatTicket from '../components/ChatTicket';
import Modal from '../components/Modal';
import { fechaCorta } from '../format';
import { useToast } from '../toast';
import type { Ticket } from '../types';

export function EstadoTicket({ estado }: { estado: Ticket['estado'] }) {
  if (estado === 'cerrado') return <span className="chip exito"><Icon nombre="check" tam={14} />Cerrado</span>;
  if (estado === 'en_proceso') return <span className="chip"><span className="punto redondo" />En curso</span>;
  return <span className="chip coral"><span className="punto" />Abierto</span>;
}

export default function Soporte() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [deps, setDeps] = useState<{ id: number; nombre: string }[]>([]);
  const [error, setError] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [chat, setChat] = useState<Ticket | null>(null);
  const [dep, setDep] = useState('');
  const [asunto, setAsunto] = useState('');
  const [dispositivo, setDispositivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState(false);
  const aviso = useToast();

  const cargar = useCallback(async () => {
    setError(false);
    try {
      setTickets(await api.get<Ticket[]>('/tickets'));
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => {
    cargar();
    api.get<{ id: number; nombre: string }[]>('/departamentos').then((d) => {
      setDeps(d);
      if (d.length) setDep(String(d[0].id));
    });
  }, [cargar]);

  const enviar = async () => {
    const er: Record<string, string> = {};
    if (!asunto.trim()) er.asunto = 'Escribe el asunto';
    if (!dispositivo.trim()) er.dispositivo = 'Indica el dispositivo';
    if (!descripcion.trim()) er.descripcion = 'Describe el problema';
    setErrores(er);
    if (Object.keys(er).length) return;
    setOcupado(true);
    try {
      await api.post('/tickets/add', { departamento_id: Number(dep), asunto: asunto.trim(), dispositivo: dispositivo.trim(), descripcion: descripcion.trim() });
      setAbierto(false);
      setAsunto('');
      setDispositivo('');
      setDescripcion('');
      aviso('Ticket enviado');
      cargar();
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo enviar el ticket');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <>
      <Barra cargando={tickets === null && !error} />
      <div className="contenedor pagina" style={{ maxWidth: 860 }}>
        <div className="pagina-cab">
          <div>
            <h1>Soporte técnico</h1>
            <p>Abre un ticket y sigue su estado.</p>
          </div>
          <button className="btn coral grande" type="button" onClick={() => { setErrores({}); setAbierto(true); }}>
            <Icon nombre="mas" />Nuevo ticket
          </button>
        </div>
        {error ? (
          <ErrorEstado onReintentar={cargar} />
        ) : tickets === null ? null : tickets.length === 0 ? (
          <Vacio icono="auricular" texto="No tienes tickets abiertos" />
        ) : (
          <div className="lista-filas">
            {tickets.map((t, i) => (
              <div key={t.id} className="tarjeta fila-pedido entra" style={{ ['--i' as string]: i }}>
                <div className="arriba">
                  <h3>{t.asunto}</h3>
                  <EstadoTicket estado={t.estado} />
                </div>
                <div className="sub">{t.departamento} · {t.dispositivo}</div>
                <div className="txt">{t.descripcion}</div>
                <div className="nota">Abierto el {fechaCorta(t.fecha_apertura)}</div>
                <div className="accion">
                  <button className="btn tonal pequeno" type="button" onClick={() => setChat(t)}>
                    <Icon nombre="chat" tam={18} />
                    {t.n_mensajes > 0 ? `Conversación (${t.n_mensajes})` : 'Abrir conversación'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {chat && <ChatTicket ticket={chat} onClose={() => { setChat(null); cargar(); }} onCambio={cargar} />}
      {abierto && (
        <Modal
          titulo="Nuevo ticket"
          onClose={() => setAbierto(false)}
          pie={
            <>
              <button className="btn fantasma" type="button" onClick={() => setAbierto(false)}>Cancelar</button>
              <button className="btn" type="button" disabled={ocupado} onClick={enviar}>Enviar</button>
            </>
          }
        >
          <div className="formulario">
            <Selector etiqueta="Departamento" value={dep} onChange={setDep}>
              {deps.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </Selector>
            <Campo etiqueta="Asunto" value={asunto} onChange={setAsunto} error={errores.asunto} />
            <Campo etiqueta="Dispositivo (ej. PS5, Galaxy S24)" value={dispositivo} onChange={setDispositivo} error={errores.dispositivo} />
            <AreaTexto etiqueta="Describe el problema" value={descripcion} onChange={setDescripcion} error={errores.descripcion} />
          </div>
        </Modal>
      )}
    </>
  );
}
