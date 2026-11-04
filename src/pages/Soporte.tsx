import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { AreaTexto, Campo, Selector } from '../components/Campos';
import { Barra, ErrorEstado, Vacio } from '../components/Estados';
import Icon from '../components/Icon';
import ChatTicket from '../components/ChatTicket';
import Modal from '../components/Modal';
import { ETIQUETA_ESTADO, euros, fechaCorta } from '../format';
import { useToast } from '../toast';
import type { Ticket } from '../types';

export function EstadoTicket({ estado }: { estado: Ticket['estado'] }) {
  if (estado === 'cerrado' || estado === 'listo') return <span className="chip exito"><Icon nombre="check" tam={14} />{ETIQUETA_ESTADO[estado]}</span>;
  if (estado === 'en_proceso' || estado === 'en_reparacion') return <span className="chip"><span className="punto redondo" />{ETIQUETA_ESTADO[estado]}</span>;
  return <span className="chip coral"><span className="punto" />{ETIQUETA_ESTADO[estado]}</span>;
}

// Camino de una reparación: recibido → presupuesto → en reparación → listo
export function PasosReparacion({ estado }: { estado: Ticket['estado'] }) {
  const pasos = ['recibido', 'presupuestado', 'en_reparacion', 'listo'] as const;
  const actual = estado === 'cerrado' ? pasos.length : pasos.indexOf(estado as (typeof pasos)[number]);
  return (
    <ol className="nota" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0, margin: '8px 0' }} aria-label="Progreso de la reparación">
      {pasos.map((p, i) => (
        <li key={p} style={{ fontWeight: i === actual ? 700 : 400, opacity: i <= actual ? 1 : 0.55 }}>{i < actual ? '✓ ' : ''}{ETIQUETA_ESTADO[p]}{i < pasos.length - 1 ? ' →' : ''}</li>
      ))}
    </ol>
  );
}

export default function Soporte() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [deps, setDeps] = useState<{ id: number; nombre: string }[]>([]);
  const [error, setError] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [chat, setChat] = useState<Ticket | null>(null);
  const [dep, setDep] = useState('');
  const [tipo, setTipo] = useState<Ticket['tipo']>('soporte');
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

  const responderPresupuesto = async (t: Ticket, aceptado: boolean) => {
    try {
      await api.put(`/tickets/presupuesto/${t.id}`, { aceptado });
      aviso(aceptado ? 'Presupuesto aceptado: empezamos la reparación' : 'Presupuesto rechazado');
      cargar();
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo responder al presupuesto');
    }
  };

  const enviar = async () => {
    const er: Record<string, string> = {};
    if (!asunto.trim()) er.asunto = 'Escribe el asunto';
    if (!dispositivo.trim()) er.dispositivo = 'Indica el dispositivo';
    if (!descripcion.trim()) er.descripcion = 'Describe el problema';
    setErrores(er);
    if (Object.keys(er).length) return;
    setOcupado(true);
    try {
      await api.post('/tickets/add', { tipo, departamento_id: Number(dep), asunto: asunto.trim(), dispositivo: dispositivo.trim(), descripcion: descripcion.trim() });
      setAbierto(false);
      setAsunto('');
      setDispositivo('');
      setDescripcion('');
      aviso(tipo === 'reparacion' ? 'Reparación solicitada' : 'Ticket enviado');
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
              <div key={t.id} className={'tarjeta fila-pedido entra' + (t.no_leidos > 0 ? ' nuevo' : '')} style={{ ['--i' as string]: i }}>
                <div className="arriba">
                  <h3>{t.tipo === 'reparacion' && <span className="chip" style={{ marginRight: 10 }}>Reparación</span>}{t.asunto}{t.no_leidos > 0 && <span className="chip coral" style={{ marginLeft: 10 }}>Nuevo</span>}</h3>
                  <EstadoTicket estado={t.estado} />
                </div>
                <div className="sub">{t.departamento} · {t.dispositivo}</div>
                <div className="txt">{t.descripcion}</div>
                <div className="nota">Abierto el {fechaCorta(t.fecha_apertura)}</div>
                {t.tipo === 'reparacion' && (
                  <>
                    <PasosReparacion estado={t.estado} />
                    {t.estado === 'presupuestado' && t.presupuesto !== null && (
                      <div role="group" aria-label="Presupuesto de la reparación" style={{ margin: '8px 0' }}>
                        <p>Presupuesto de la reparación: <b>{euros(t.presupuesto)}</b>. Si lo aceptas, empezamos a repararlo.</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button className="btn pequeno" type="button" onClick={() => responderPresupuesto(t, true)}>Aceptar presupuesto</button>
                          <button className="btn pequeno fantasma" type="button" onClick={() => responderPresupuesto(t, false)}>Rechazar</button>
                        </div>
                      </div>
                    )}
                    {t.estado === 'listo' && <p className="nota"><b>Tu equipo está listo: puedes pasar a recogerlo por tu tienda Jokoa.</b></p>}
                    {t.estado === 'cerrado' && t.presupuesto_aceptado === false && <p className="nota">Rechazaste el presupuesto ({t.presupuesto !== null ? euros(t.presupuesto) : ''}).</p>}
                  </>
                )}
                <div className="accion">
                  <button className={'btn pequeno ' + (t.no_leidos > 0 ? 'coral' : 'tonal')} type="button" onClick={() => setChat(t)}>
                    <Icon nombre="chat" tam={18} />
                    {t.no_leidos > 0 ? `Ver respuesta (${t.no_leidos})` : t.n_mensajes > 0 ? 'Ver conversación' : 'Abrir conversación'}
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
            <Selector etiqueta="¿Qué necesitas?" value={tipo} onChange={(v) => setTipo(v as Ticket['tipo'])}>
              <option value="soporte">Una consulta o incidencia</option>
              <option value="reparacion">Reparar un equipo (presupuesto y seguimiento)</option>
            </Selector>
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
