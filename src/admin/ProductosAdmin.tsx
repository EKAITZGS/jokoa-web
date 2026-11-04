import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { AreaTexto, Campo, Selector } from '../components/Campos';
import { Barra, ErrorEstado } from '../components/Estados';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { CATEGORIAS, euros } from '../format';
import { useToast } from '../toast';
import type { Producto, Tipo } from '../types';

const VACIO = {
  nombre: '', descripcion: '', precio: '', stock: '', imagen: '',
  plataforma_id: '', genero: '', pegi: '3', precio_alquiler_dia: '',
  marca: '', almacenamiento_gb: '', ram_gb: '',
  categoria: 'portatil', montaje: '0', caract: '',
};

// Características de un artículo como líneas "clave: valor" (números y sí/no se guardan como tales)
const aLineas = (c?: Record<string, unknown>) =>
  Object.entries(c ?? {}).filter(([k]) => k !== 'etiquetas').map(([k, v]) => `${k}: ${typeof v === 'boolean' ? (v ? 'sí' : 'no') : Array.isArray(v) ? v.join(', ') : v}`).join('\n');
const deLineas = (texto: string) => {
  const salida: Record<string, unknown> = {};
  for (const linea of texto.split('\n')) {
    const i = linea.indexOf(':');
    if (i < 1) continue;
    const k = linea.slice(0, i).trim();
    const v = linea.slice(i + 1).trim();
    if (!k || !v) continue;
    salida[k] = /^(sí|si|true)$/i.test(v) ? true : /^(no|false)$/i.test(v) ? false : /^-?\d+([.,]\d+)?$/.test(v) ? Number(v.replace(',', '.')) : v;
  }
  return salida;
};

export default function ProductosAdmin() {
  const [tipo, setTipo] = useState<Tipo>('videojuegos');
  const movil = tipo === 'moviles';
  const articulo = tipo === 'articulos';
  const cuadrada = tipo !== 'videojuegos'; // las fotos de móviles y artículos se ven enteras
  const nombreTipo = movil ? 'móvil' : articulo ? 'artículo' : 'videojuego';
  const [lista, setLista] = useState<Producto[] | null>(null);
  const [plataformas, setPlataformas] = useState<{ id: number; nombre: string }[]>([]);
  const [error, setError] = useState(false);
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState<Producto | 'nuevo' | null>(null);
  const [borrando, setBorrando] = useState<Producto | null>(null);
  const [f, setF] = useState(VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const aviso = useToast();

  const cargar = useCallback(async () => {
    setError(false);
    setLista(null);
    try {
      setLista(await api.get<Producto[]>('/' + tipo));
    } catch {
      setError(true);
    }
  }, [tipo]);
  useEffect(() => {
    cargar();
  }, [cargar]);
  useEffect(() => {
    api.get<{ id: number; nombre: string }[]>('/plataformas').then(setPlataformas).catch(() => {});
  }, []);

  const abrir = (p: Producto | 'nuevo') => {
    setErrores({});
    setEditando(p);
    setF(
      p === 'nuevo'
        ? { ...VACIO, plataforma_id: String(plataformas[0]?.id ?? '') }
        : {
            nombre: p.nombre, descripcion: p.descripcion, precio: String(p.precio), stock: String(p.stock), imagen: p.imagenes[0] ?? '',
            plataforma_id: String(p.plataforma_id ?? ''), genero: p.genero ?? '', pegi: String(p.pegi ?? 3), precio_alquiler_dia: String(p.precio_alquiler_dia ?? ''),
            marca: p.marca ?? '', almacenamiento_gb: String(p.almacenamiento_gb ?? ''), ram_gb: String(p.ram_gb ?? ''),
            categoria: p.categoria ?? 'portatil', montaje: String(p.montaje ?? 0), caract: aLineas(p.caracteristicas),
          },
    );
  };
  const poner = (k: keyof typeof VACIO) => (v: string) => setF({ ...f, [k]: v });

  const subir = async (archivo: File | undefined) => {
    if (!archivo) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) return setErrores({ ...errores, imagen: 'Solo JPG, PNG o WebP' });
    if (archivo.size > 2 * 1024 * 1024) return setErrores({ ...errores, imagen: 'La imagen pesa más de 2 MB' });
    setSubiendo(true);
    try {
      const datos = new FormData();
      datos.append('archivo', archivo);
      const r = await api.subir<{ url: string }>('/admin/imagenes', datos);
      setF((a) => ({ ...a, imagen: r.url }));
      setErrores((e) => ({ ...e, imagen: '' }));
    } catch (e) {
      setErrores((er) => ({ ...er, imagen: e instanceof ApiError ? e.message : 'No se pudo subir la imagen' }));
    } finally {
      setSubiendo(false);
    }
  };

  const numero = (v: string) => Number(v.replace(',', '.'));
  const guardar = async () => {
    const er: Record<string, string> = {};
    if (!f.nombre.trim()) er.nombre = 'Escribe el nombre';
    if (!f.descripcion.trim()) er.descripcion = 'Escribe la descripción';
    if (f.precio === '' || !(numero(f.precio) >= 0)) er.precio = 'Precio no válido';
    if (f.stock === '' || !Number.isInteger(numero(f.stock)) || numero(f.stock) < 0) er.stock = 'Stock entero, 0 o más';
    if (!f.imagen.trim()) er.imagen = 'Sube una foto del producto';
    if (articulo) {
      if (!f.marca.trim()) er.marca = 'Escribe la marca';
      if (f.montaje === '' || !(numero(f.montaje) >= 0)) er.montaje = 'Montaje no válido';
    } else if (movil) {
      if (!f.marca.trim()) er.marca = 'Escribe la marca';
      if (!(numero(f.almacenamiento_gb) > 0)) er.almacenamiento_gb = 'Indica los GB';
      if (!(numero(f.ram_gb) > 0)) er.ram_gb = 'Indica los GB de RAM';
    } else {
      if (!f.plataforma_id) er.plataforma_id = 'Elige la plataforma';
      if (!f.genero.trim()) er.genero = 'Escribe el género';
      if (f.precio_alquiler_dia === '' || !(numero(f.precio_alquiler_dia) >= 0)) er.precio_alquiler_dia = 'Precio no válido';
    }
    setErrores(er);
    if (Object.keys(er).length) return;
    const base = { nombre: f.nombre.trim(), descripcion: f.descripcion.trim(), precio: numero(f.precio), stock: numero(f.stock), imagen: f.imagen.trim() };
    const cuerpo = articulo
      ? { ...base, categoria: f.categoria, marca: f.marca.trim(), montaje: numero(f.montaje), caracteristicas: deLineas(f.caract) }
      : movil
      ? { ...base, marca: f.marca.trim(), almacenamiento_gb: numero(f.almacenamiento_gb), ram_gb: numero(f.ram_gb) }
      : { ...base, plataforma_id: Number(f.plataforma_id), genero: f.genero.trim(), pegi: Number(f.pegi), precio_alquiler_dia: numero(f.precio_alquiler_dia) };
    setOcupado(true);
    try {
      if (editando === 'nuevo') await api.post(`/${tipo}/add`, cuerpo);
      else await api.put(`/${tipo}/update/${(editando as Producto).id}`, cuerpo);
      aviso(editando === 'nuevo' ? 'Producto añadido' : 'Producto actualizado');
      setEditando(null);
      cargar();
    } catch (e) {
      setErrores({ general: e instanceof ApiError ? e.message : 'No se pudo guardar' });
    } finally {
      setOcupado(false);
    }
  };

  const borrar = async () => {
    if (!borrando) return;
    setOcupado(true);
    try {
      await api.borrar(`/${tipo}/delete/${borrando.id}`);
      aviso('Producto eliminado');
      setBorrando(null);
      cargar();
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo eliminar');
      setBorrando(null);
    } finally {
      setOcupado(false);
    }
  };

  const t = busca.trim().toLowerCase();
  const visibles = (lista ?? []).filter((p) => !t || p.nombre.toLowerCase().includes(t));

  return (
    <>
      <Barra cargando={lista === null && !error} />
      <div className="admin-cab" style={{ marginTop: 8 }}>
        <div>
          <h1>Productos</h1>
          <p>Añade, edita o retira videojuegos, móviles y artículos (ordenadores, tablets y gaming).</p>
        </div>
        <button className="btn grande" type="button" onClick={() => abrir('nuevo')}><Icon nombre="mas" />Añadir {nombreTipo}</button>
      </div>
      <div className="pestanas" role="tablist" style={{ marginBottom: 16 }}>
        {([['videojuegos', 'Videojuegos'], ['moviles', 'Móviles'], ['articulos', 'Artículos']] as [Tipo, string][]).map(([v, t]) => (
          <button key={v} type="button" role="tab" aria-selected={tipo === v} className={tipo === v ? 'activa' : ''} onClick={() => setTipo(v)}>{t}</button>
        ))}
      </div>
      <div className="barra-herr"><Campo etiqueta="Buscar por nombre" value={busca} onChange={setBusca} /></div>
      {error ? (
        <ErrorEstado onReintentar={cargar} />
      ) : (
        <div className="tarjeta panel">
          <div className="tabla-caja">
            <table className="tabla">
              <thead>
                <tr>
                  <th />
                  <th>Producto</th>
                  <th>{cuadrada ? 'Marca' : 'Plataforma'}</th>
                  <th>{articulo ? 'Categoría' : movil ? 'Memoria / RAM' : 'Género / PEGI'}</th>
                  <th className="num">Precio</th>
                  {tipo === 'videojuegos' && <th className="num">Alquiler/día</th>}
                  <th className="num">Stock</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visibles.map((p) => (
                  <tr key={p.id}>
                    <td><img className={'miniatura' + (cuadrada ? ' movil' : '')} src={p.imagenes[0]} alt="" /></td>
                    <td className="principal">{p.nombre}</td>
                    <td>{cuadrada ? p.marca : p.plataforma}</td>
                    <td>{articulo ? CATEGORIAS[p.categoria ?? ''] ?? p.categoria : movil ? `${p.almacenamiento_gb} GB · ${p.ram_gb} GB` : `${p.genero} · PEGI ${p.pegi}`}</td>
                    <td className="num">{euros(p.precio)}</td>
                    {tipo === 'videojuegos' && <td className="num">{euros(p.precio_alquiler_dia ?? 0)}</td>}
                    <td className="num"><span className={'chip' + (p.stock === 0 ? ' gris' : p.stock <= 3 ? ' coral' : '')}>{p.stock}</span></td>
                    <td>
                      <div className="acciones">
                        <button className="icono-btn" type="button" aria-label={`Editar ${p.nombre}`} onClick={() => abrir(p)}><Icon nombre="editar" /></button>
                        <button className="icono-btn peligro" type="button" aria-label={`Eliminar ${p.nombre}`} onClick={() => setBorrando(p)}><Icon nombre="basura" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lista && visibles.length === 0 && <div className="vacio-tabla">No hay productos.</div>}
          </div>
        </div>
      )}

      {editando && (
        <Modal
          titulo={editando === 'nuevo' ? `Añadir ${nombreTipo}` : 'Editar producto'}
          onClose={() => setEditando(null)}
          pie={
            <>
              <button className="btn fantasma" type="button" onClick={() => setEditando(null)}>Cancelar</button>
              <button className="btn" type="button" disabled={ocupado || subiendo} onClick={guardar}>Guardar</button>
            </>
          }
        >
          <div className="formulario">
            <div className="subida">
              {f.imagen ? <img className={'vista' + (cuadrada ? ' movil' : '')} src={f.imagen} alt="Vista previa" /> : <div className="vacia">Sin foto</div>}
              <div>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => subir(e.target.files?.[0])} aria-label="Foto del producto" />
                <div className="nota" style={{ marginTop: 6 }}>{subiendo ? 'Subiendo…' : 'JPG, PNG o WebP de hasta 2 MB.'}</div>
                {errores.imagen && <div className="error-texto">{errores.imagen}</div>}
              </div>
            </div>
            <Campo etiqueta="Nombre" value={f.nombre} onChange={poner('nombre')} error={errores.nombre} />
            <AreaTexto etiqueta="Descripción" value={f.descripcion} onChange={poner('descripcion')} error={errores.descripcion} />
            <div className="fila-campos">
              <Campo etiqueta="Precio (€)" inputMode="decimal" value={f.precio} onChange={poner('precio')} error={errores.precio} />
              <Campo etiqueta="Stock" inputMode="numeric" value={f.stock} onChange={poner('stock')} error={errores.stock} />
            </div>
            {articulo ? (
              <>
                <div className="fila-campos">
                  <Selector etiqueta="Categoría" value={f.categoria} onChange={poner('categoria')}>
                    {Object.entries(CATEGORIAS).map(([k, n]) => (
                      <option key={k} value={k}>{n}</option>
                    ))}
                  </Selector>
                  <Campo etiqueta="Marca" value={f.marca} onChange={poner('marca')} error={errores.marca} />
                </div>
                <Campo etiqueta="Montaje de Jokoa (€, ya incluido en el precio)" inputMode="decimal" value={f.montaje} onChange={poner('montaje')} error={errores.montaje} />
                <AreaTexto etiqueta="Características (una por línea: dato: valor)" rows={6} value={f.caract} onChange={poner('caract')} />
              </>
            ) : movil ? (
              <>
                <Campo etiqueta="Marca" value={f.marca} onChange={poner('marca')} error={errores.marca} />
                <div className="fila-campos">
                  <Campo etiqueta="Almacenamiento (GB)" inputMode="numeric" value={f.almacenamiento_gb} onChange={poner('almacenamiento_gb')} error={errores.almacenamiento_gb} />
                  <Campo etiqueta="RAM (GB)" inputMode="numeric" value={f.ram_gb} onChange={poner('ram_gb')} error={errores.ram_gb} />
                </div>
              </>
            ) : (
              <>
                <div className="fila-campos">
                  <Selector etiqueta="Plataforma" value={f.plataforma_id} onChange={poner('plataforma_id')}>
                    {plataformas.map((pl) => (
                      <option key={pl.id} value={pl.id}>{pl.nombre}</option>
                    ))}
                  </Selector>
                  <Campo etiqueta="Género" value={f.genero} onChange={poner('genero')} error={errores.genero} />
                </div>
                <div className="fila-campos">
                  <Selector etiqueta="PEGI" value={f.pegi} onChange={poner('pegi')}>
                    {[3, 7, 12, 16, 18].map((n) => (
                      <option key={n} value={n}>PEGI {n}</option>
                    ))}
                  </Selector>
                  <Campo etiqueta="Alquiler por día (€)" inputMode="decimal" value={f.precio_alquiler_dia} onChange={poner('precio_alquiler_dia')} error={errores.precio_alquiler_dia} />
                </div>
              </>
            )}
            {errores.general && <div className="error-texto">{errores.general}</div>}
          </div>
        </Modal>
      )}

      {borrando && (
        <Modal
          estrecho
          titulo="¿Eliminar producto?"
          onClose={() => setBorrando(null)}
          pie={
            <>
              <button className="btn fantasma" type="button" onClick={() => setBorrando(null)}>Cancelar</button>
              <button className="btn coral" type="button" disabled={ocupado} onClick={borrar}>Eliminar</button>
            </>
          }
        >
          <p>Se eliminará <b>{borrando.nombre}</b>. Si ya tiene compras o alquileres no se podrá eliminar.</p>
        </Modal>
      )}
    </>
  );
}
