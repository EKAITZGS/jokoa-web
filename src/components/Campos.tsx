import { useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import Icon from './Icon';

const idDe = (etiqueta: string) => 'c-' + etiqueta.replace(/\W+/g, '-').toLowerCase();

interface PropsCampo extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  etiqueta: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

// Campo de texto con etiqueta flotante, ojo para contraseñas y mensaje de error
export function Campo({ etiqueta, value, onChange, error, type = 'text', id, ...resto }: PropsCampo) {
  const [ver, setVer] = useState(false);
  const idc = id ?? idDe(etiqueta);
  const esClave = type === 'password';
  return (
    <div>
      <div className={'campo' + (error ? ' error' : '')}>
        <input
          id={idc}
          type={esClave && ver ? 'text' : type}
          value={value}
          placeholder=" "
          onChange={(e) => onChange(e.target.value)}
          style={esClave ? { paddingRight: 52 } : undefined}
          {...resto}
        />
        <label htmlFor={idc}>{etiqueta}</label>
        {esClave && (
          <button type="button" className="icono-btn ojo" onClick={() => setVer(!ver)} aria-label="Mostrar u ocultar la contraseña">
            <Icon nombre="ojo" />
          </button>
        )}
      </div>
      {error && <div className="error-texto">{error}</div>}
    </div>
  );
}

export function Selector({ etiqueta, value, onChange, children, id }: { etiqueta: string; value: string; onChange: (v: string) => void; children: ReactNode; id?: string }) {
  const idc = id ?? idDe(etiqueta);
  return (
    <div className="campo">
      <select id={idc} value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
      <label htmlFor={idc}>{etiqueta}</label>
    </div>
  );
}

interface PropsArea extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  etiqueta: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export function AreaTexto({ etiqueta, value, onChange, error, ...resto }: PropsArea) {
  const idc = idDe(etiqueta);
  return (
    <div>
      <div className={'campo' + (error ? ' error' : '')}>
        <textarea id={idc} value={value} placeholder=" " onChange={(e) => onChange(e.target.value)} {...resto} />
        <label htmlFor={idc}>{etiqueta}</label>
      </div>
      {error && <div className="error-texto">{error}</div>}
    </div>
  );
}
