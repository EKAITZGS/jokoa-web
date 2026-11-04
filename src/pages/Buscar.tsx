import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { Campo, Selector } from '../components/Campos';
import { Barra, CargandoRejilla, ErrorEstado, Vacio } from '../components/Estados';
import ProductCard from '../components/ProductCard';
import { rutaTipo } from '../format';
import type { Producto } from '../types';

const SECCIONES: [string, string][] = [['', 'Todo'], ['videojuegos', 'Juegos'], ['moviles', 'Móviles'], ['articulos', 'Ordenadores, tablets y gaming']];

// Búsqueda en toda la tienda: la palabra viene de la cabecera (?q=) y se afina con filtros
export default function Buscar() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [items, setItems] = useState<Producto[] | null>(null);
  const [error, setError] = useState(false);
  const [seccion, setSeccion] = useState('');
  const [maximo, setMaximo] = useState('');
  const [soloStock, setSoloStock] = useState(false);
  const [orden, setOrden] = useState('relevancia');

  const cargar = useCallback(async () => {
    setError(false);
    setItems(null);
    try {
      const [j, m, a] = await Promise.all([api.get<Producto[]>('/videojuegos'), api.get<Producto[]>('/moviles'), api.get<Producto[]>('/articulos')]);
      setItems([...j, ...m, ...a]);
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const lista = useMemo(() => {
    const palabras = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const tope = Number(maximo);
    const texto = (p: Producto) => [p.nombre, p.marca, p.plataforma, p.genero, p.categoria, p.descripcion].join(' ').toLowerCase();
    return (items ?? [])
      .filter((p) => (!seccion || rutaTipo(p) === seccion) && (!soloStock || p.stock > 0) && (!tope || p.precio <= tope) && palabras.every((w) => texto(p).includes(w)))
      .sort((a, b) => {
        if (orden === 'precio-asc') return a.precio - b.precio;
        if (orden === 'precio-desc') return b.precio - a.precio;
        // relevancia: primero los que llevan la búsqueda en el nombre
        const pa = palabras.every((w) => a.nombre.toLowerCase().includes(w)) ? 0 : 1;
        const pb = palabras.every((w) => b.nombre.toLowerCase().includes(w)) ? 0 : 1;
        return pa - pb || a.nombre.localeCompare(b.nombre);
      });
  }, [items, q, seccion, maximo, soloStock, orden]);

  return (
    <>
      <Barra cargando={items === null && !error} />
      <div className="contenedor pagina">
        <div className="pagina-cab">
          <div>
            <h1>{q ? `Resultados para «${q}»` : 'Buscar'}</h1>
            <p>{items && `${lista.length} ${lista.length === 1 ? 'producto' : 'productos'}`}</p>
          </div>
        </div>
        <div className="pestanas subsecciones" role="tablist">
          {SECCIONES.map(([v, t]) => (
            <button key={v} type="button" role="tab" aria-selected={seccion === v} className={seccion === v ? 'activa' : ''} onClick={() => setSeccion(v)}>{t}</button>
          ))}
        </div>
        <div className="filtros">
          <Campo etiqueta="Buscar" value={q} onChange={(v) => setParams(v ? { q: v } : {}, { replace: true })} />
          <Campo etiqueta="Precio máximo (€)" type="number" min="0" value={maximo} onChange={setMaximo} />
          <Selector etiqueta="Ordenar por" value={orden} onChange={setOrden}>
            <option value="relevancia">Relevancia</option>
            <option value="precio-asc">Precio: de menor a mayor</option>
            <option value="precio-desc">Precio: de mayor a menor</option>
          </Selector>
        </div>
        <label className="casilla" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24 }}>
          <input type="checkbox" checked={soloStock} onChange={(e) => setSoloStock(e.target.checked)} />
          Solo productos con stock
        </label>
        {error ? (
          <ErrorEstado onReintentar={cargar} />
        ) : items === null ? (
          <CargandoRejilla />
        ) : lista.length === 0 ? (
          <Vacio icono="carrito" texto="No hay productos con esa búsqueda" />
        ) : (
          <div className="rejilla">
            {lista.map((p, i) => (
              <ProductCard key={`${rutaTipo(p)}-${p.id}`} p={p} i={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
