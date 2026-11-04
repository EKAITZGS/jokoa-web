import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api';
import { euros } from '../format';
import Icon from './Icon';

interface Tarjeta {
  id: number;
  nombre: string;
  tipo: 'videojuego' | 'movil' | 'articulo';
  precio: number;
  imagen: string | null;
}
interface Turno {
  role: 'user' | 'assistant';
  content: string;
  productos?: Tarjeta[];
}

const BIENVENIDA: Turno = {
  role: 'assistant',
  content: '¡Hola! Soy el asesor de Jokoa. Cuéntame qué buscas (un RPG, un móvil con buena cámara, algo gratis...) y te recomiendo lo que tenemos.',
};

// Burbuja de chat con el asesor de compra: el servidor consulta el catálogo real y devuelve texto y tarjetas
export default function AsistenteChat() {
  const [abierto, setAbierto] = useState(false);
  const [turnos, setTurnos] = useState<Turno[]>([BIENVENIDA]);
  const [texto, setTexto] = useState('');
  const [pensando, setPensando] = useState(false);
  const [error, setError] = useState('');
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fin.current?.scrollIntoView({ block: 'end' });
  }, [turnos.length, pensando, abierto]);

  const enviar = async () => {
    const limpio = texto.trim();
    if (!limpio || pensando) return;
    const nuevos: Turno[] = [...turnos, { role: 'user', content: limpio }];
    setTurnos(nuevos);
    setTexto('');
    setError('');
    setPensando(true);
    try {
      // La bienvenida no se manda: el servidor exige que la conversación empiece por el cliente
      const mensajes = nuevos.slice(1).map(({ role, content }) => ({ role, content }));
      const r = await api.post<{ respuesta: string; productos: Tarjeta[] }>('/asistente', { mensajes });
      setTurnos([...nuevos, { role: 'assistant', content: r.respuesta, productos: r.productos }]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo consultar al asesor');
    } finally {
      setPensando(false);
    }
  };

  const teclado = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <>
      <button className="asesor-fab" type="button" aria-expanded={abierto} aria-label={abierto ? 'Cerrar el asesor' : 'Abrir el asesor de compra'} onClick={() => setAbierto(!abierto)}>
        <Icon nombre={abierto ? 'cerrar' : 'chat'} tam={26} />
        {!abierto && <span>Asesor</span>}
      </button>
      {abierto && (
        <section className="asesor" aria-label="Asesor de compra">
          <header>
            <b>Asesor Jokoa</b>
            <span>Te ayudo a elegir tu juego o tu móvil</span>
          </header>
          <div className="asesor-hilo" aria-live="polite">
            {turnos.map((t, i) => (
              <div key={i} className={'asesor-msg ' + (t.role === 'user' ? 'yo' : 'bot')}>
                <p>{t.content}</p>
                {t.productos?.map((p) => (
                  <Link key={p.id} className="asesor-tarjeta" to={`/producto/${{ videojuego: 'videojuegos', movil: 'moviles', articulo: 'articulos' }[p.tipo]}/${p.id}`} onClick={() => setAbierto(false)}>
                    {p.imagen && <img src={p.imagen} alt="" loading="lazy" />}
                    <span>
                      <b>{p.nombre}</b>
                      <small>{p.precio === 0 ? 'Gratis' : euros(p.precio)}</small>
                    </span>
                  </Link>
                ))}
              </div>
            ))}
            {pensando && <div className="asesor-msg bot"><p className="asesor-pensando">Buscando en el catálogo…</p></div>}
            {error && <p className="asesor-error" role="alert">{error}</p>}
            <div ref={fin} />
          </div>
          <div className="asesor-entrada">
            <textarea rows={1} maxLength={600} value={texto} placeholder="Escribe tu pregunta" aria-label="Tu pregunta" onChange={(e) => setTexto(e.target.value)} onKeyDown={teclado} />
            <button type="button" className="icono-btn" aria-label="Enviar" disabled={pensando || !texto.trim()} onClick={enviar}>
              <Icon nombre="enviar" />
            </button>
          </div>
        </section>
      )}
    </>
  );
}
