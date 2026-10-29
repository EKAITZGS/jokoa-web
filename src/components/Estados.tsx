import Icon from './Icon';

export function CargandoRejilla({ n = 8 }: { n?: number }) {
  return (
    <div className="rejilla">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="tarjeta skeleton-tarjeta pulso">
          <div style={{ aspectRatio: '3 / 4', background: 'var(--gris)' }} />
          <div style={{ padding: 16, display: 'grid', gap: 10 }}>
            <div className="b" style={{ height: 16, width: '70%' }} />
            <div className="b" style={{ height: 12, width: '50%' }} />
            <div className="b" style={{ height: 18, width: '30%', marginTop: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorEstado({ onReintentar, texto = 'No se pudieron cargar los datos' }: { onReintentar?: () => void; texto?: string }) {
  return (
    <div className="estado-centro">
      <div className="circulo">
        <Icon nombre="nube" tam={40} />
      </div>
      <h2 style={{ fontSize: 18 }}>{texto}</h2>
      {onReintentar && (
        <button className="btn coral" type="button" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function Vacio({ icono, texto }: { icono: string; texto: string }) {
  return (
    <div className="estado-centro">
      <div className="circulo">
        <Icon nombre={icono} tam={40} />
      </div>
      <p>{texto}</p>
    </div>
  );
}

export const Barra = ({ cargando }: { cargando: boolean }) => (cargando ? <div className="barra-carga" /> : null);
