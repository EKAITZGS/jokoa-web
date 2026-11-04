import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { Campo, Selector } from '../components/Campos';
import { Barra, CargandoRejilla, ErrorEstado, Vacio } from '../components/Estados';
import ProductCard from '../components/ProductCard';
import { CATEGORIAS } from '../format';
import type { Producto } from '../types';

export type Seccion = 'ordenadores' | 'tablets' | 'gaming';

// Cada sección agrupa categorías de la tabla articulo
const SECCIONES: Record<Seccion, { titulo: string; texto: string; categorias: string[] }> = {
  ordenadores: { titulo: 'Ordenadores', texto: 'Portátiles, sobremesa y PC gaming montados en Jokoa.', categorias: ['portatil', 'sobremesa', 'pc_gaming'] },
  tablets: { titulo: 'Tablets', texto: 'Para estudiar, dibujar, leer o ver series.', categorias: ['tablet'] },
  gaming: { titulo: 'Zona gaming', texto: 'Consolas, mandos, auriculares, teclados, ratones, monitores y sillas.', categorias: ['consola', 'mando', 'auriculares', 'teclado', 'raton', 'monitor', 'silla'] },
};

export default function Articulos({ seccion }: { seccion: Seccion }) {
  const { titulo, texto, categorias } = SECCIONES[seccion];
  const [items, setItems] = useState<Producto[] | null>(null);
  const [error, setError] = useState(false);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [marca, setMarca] = useState('');
  const [orden, setOrden] = useState('nombre');

  const cargar = useCallback(async () => {
    setError(false);
    setItems(null);
    try {
      const todos = await api.get<Producto[]>('/articulos');
      setItems(todos.filter((p) => categorias.includes(p.categoria ?? '')));
    } catch {
      setError(true);
    }
  }, [seccion]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setBusca('');
    setCategoria('');
    setMarca('');
    cargar();
  }, [cargar]);

  const delTipo = useMemo(() => (items ?? []).filter((p) => !categoria || p.categoria === categoria), [items, categoria]);
  const marcas = useMemo(() => [...new Set(delTipo.map((p) => p.marca ?? ''))].sort(), [delTipo]);
  const lista = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return delTipo
      .filter((p) => (!t || p.nombre.toLowerCase().includes(t)) && (!marca || p.marca === marca))
      .sort((a, b) => (orden === 'precio-asc' ? a.precio - b.precio : orden === 'precio-desc' ? b.precio - a.precio : a.nombre.localeCompare(b.nombre)));
  }, [delTipo, busca, marca, orden]);

  return (
    <>
      <Barra cargando={items === null && !error} />
      <div className="contenedor pagina">
        <div className="pagina-cab">
          <div>
            <h1>{titulo}</h1>
            <p>{texto}</p>
          </div>
        </div>
        {categorias.length > 1 && (
          <div className="pestanas subsecciones" role="tablist">
            <button type="button" role="tab" aria-selected={categoria === ''} className={categoria === '' ? 'activa' : ''} onClick={() => { setCategoria(''); setMarca(''); }}>Todo</button>
            {categorias.map((c) => (
              <button key={c} type="button" role="tab" aria-selected={categoria === c} className={categoria === c ? 'activa' : ''} onClick={() => { setCategoria(c); setMarca(''); }}>
                {CATEGORIAS[c]}
              </button>
            ))}
          </div>
        )}
        <div className="filtros">
          <Campo etiqueta="Buscar por nombre" value={busca} onChange={setBusca} />
          <Selector etiqueta="Marca" value={marca} onChange={setMarca}>
            <option value="">Todas</option>
            {marcas.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Selector>
          <Selector etiqueta="Ordenar por" value={orden} onChange={setOrden}>
            <option value="nombre">Nombre</option>
            <option value="precio-asc">Precio: de menor a mayor</option>
            <option value="precio-desc">Precio: de mayor a menor</option>
          </Selector>
        </div>
        {error ? (
          <ErrorEstado onReintentar={cargar} />
        ) : items === null ? (
          <CargandoRejilla />
        ) : lista.length === 0 ? (
          <Vacio icono="carrito" texto="No hay productos con esos filtros" />
        ) : (
          <div className="rejilla">
            {lista.map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
