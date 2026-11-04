import { Children, Fragment, isValidElement, useEffect, useRef, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type TextareaHTMLAttributes } from 'react';
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

interface Opcion { valor: string; texto: string; off: boolean }

const textoDe = (n: ReactNode): string =>
  Children.toArray(n).map((x) => (typeof x === 'string' || typeof x === 'number' ? String(x) : isValidElement(x) ? textoDe((x.props as { children?: ReactNode }).children) : '')).join('');

// Se leen las <option> que ya pasa cada pantalla, para no cambiar ninguno de sus usos
function opcionesDe(hijos: ReactNode): Opcion[] {
  const res: Opcion[] = [];
  Children.forEach(hijos, (h) => {
    if (!isValidElement(h)) return;
    const p = h.props as { value?: string | number; children?: ReactNode; disabled?: boolean };
    if (h.type === Fragment) res.push(...opcionesDe(p.children));
    else if (h.type === 'option') res.push({ valor: String(p.value ?? textoDe(p.children)), texto: textoDe(p.children), off: !!p.disabled });
  });
  return res;
}

// Desplegable propio (el nativo lo dibuja el sistema y no sigue el diseño): teclado, lector de pantalla y modo oscuro
export function Selector({ etiqueta, value, onChange, children, id }: { etiqueta: string; value: string; onChange: (v: string) => void; children: ReactNode; id?: string }) {
  const idc = id ?? idDe(etiqueta);
  const ops = opcionesDe(children);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const caja = useRef<HTMLDivElement>(null);
  const actual = ops.find((o) => o.valor === value);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => { if (!caja.current?.contains(e.target as Node)) setAbierto(false); };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, [abierto]);

  const abrir = () => {
    setActivo(Math.max(0, ops.findIndex((o) => o.valor === value)));
    setAbierto(true);
  };
  const elegir = (o: Opcion) => {
    if (o.off) return;
    onChange(o.valor);
    setAbierto(false);
  };
  const alTeclear = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') {
      if (abierto) { e.stopPropagation(); setAbierto(false); } // no cierra también el diálogo que lo contiene
      return;
    }
    if (!abierto) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); abrir(); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActivo((a) => Math.min(ops.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActivo((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (ops[activo]) elegir(ops[activo]); }
    else if (e.key === 'Tab') setAbierto(false);
  };

  return (
    <div className={'campo selector' + (abierto ? ' abierto' : '')} ref={caja}>
      <button
        type="button"
        id={idc}
        className="selector-btn"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={idc + '-lista'}
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        onKeyDown={alTeclear}
      >
        {actual?.texto}
      </button>
      <label htmlFor={idc}>{etiqueta}</label>
      {abierto && (
        <ul id={idc + '-lista'} className="selector-lista" role="listbox" aria-label={etiqueta}>
          {ops.map((o, i) => (
            <li
              key={i}
              role="option"
              aria-selected={o.valor === value}
              aria-disabled={o.off || undefined}
              className={(i === activo ? 'activo ' : '') + (o.valor === value ? 'elegido' : '')}
              onMouseEnter={() => setActivo(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => elegir(o)}
            >
              <span>{o.texto}</span>
              {o.valor === value && <Icon nombre="check" tam={18} />}
            </li>
          ))}
        </ul>
      )}
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
