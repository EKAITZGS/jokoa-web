import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { ErrorEstado } from '../components/Estados';
import Icon from '../components/Icon';
import type { Tienda } from '../types';

const icono = (sel: boolean) =>
  L.divIcon({
    className: 'pin-tienda',
    html: `<img src="/pin${sel ? '-sel' : ''}.svg" width="40" height="52" alt="" />`,
    iconSize: [40, 52],
    iconAnchor: [20, 52],
  });

export default function Tiendas() {
  const [tiendas, setTiendas] = useState<Tienda[] | null>(null);
  const [error, setError] = useState(false);
  const [sel, setSel] = useState(0);
  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const marcadores = useRef<L.Marker[]>([]);

  const cargar = () => {
    setError(false);
    api.get<Tienda[]>('/tiendas').then(setTiendas).catch(() => setError(true));
  };
  useEffect(cargar, []);

  // Se crea el mapa una vez que llegan las tiendas (mosaicos grises de Esri, como en las apps)
  useEffect(() => {
    if (!tiendas || !caja.current || mapa.current) return;
    const m = L.map(caja.current, { scrollWheelZoom: false }).setView([43.29, -2.96], 11);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'Tiles © Esri',
    }).addTo(m);
    marcadores.current = tiendas.map((t, i) => L.marker([t.latitud, t.longitud], { icon: icono(i === 0) }).addTo(m).on('click', () => setSel(i)));
    if (tiendas.length > 1) m.fitBounds(L.latLngBounds(tiendas.map((t) => [t.latitud, t.longitud] as [number, number])), { padding: [60, 60] });
    mapa.current = m;
    return () => {
      m.remove();
      mapa.current = null;
    };
  }, [tiendas]);

  useEffect(() => {
    marcadores.current.forEach((m, i) => {
      m.setIcon(icono(i === sel));
      m.setZIndexOffset(i === sel ? 1000 : 0);
    });
    const t = tiendas?.[sel];
    if (t && mapa.current) mapa.current.panTo([t.latitud, t.longitud]);
  }, [sel, tiendas]);

  return (
    <div className="contenedor pagina">
      <div className="pagina-cab">
        <div>
          <h1>Nuestras tiendas</h1>
          <p>Encuentra tu tienda Jokoa más cercana.</p>
        </div>
      </div>
      {error ? (
        <ErrorEstado onReintentar={cargar} />
      ) : (
        <div className="tiendas-vista">
          <div className="tiendas-lista">
            {(tiendas ?? []).map((t, i) => (
              <div key={t.id} className={'tienda-item' + (i === sel ? ' sel' : '')} onClick={() => setSel(i)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSel(i)}>
                <h3>{t.nombre}</h3>
                <div className="dato"><Icon nombre="lugar" tam={18} />{t.direccion}</div>
                <div className="dato"><Icon nombre="reloj" tam={18} />{t.horario}</div>
                <div className="dato"><Icon nombre="telefono" tam={18} />Tel. {t.telefono}</div>
                <a className="btn pequeno" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${t.latitud},${t.longitud}`}>
                  <Icon nombre="direccion" tam={18} />Cómo llegar
                </a>
              </div>
            ))}
          </div>
          <div className="mapa" ref={caja} />
        </div>
      )}
    </div>
  );
}
