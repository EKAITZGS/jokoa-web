import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { Campo, Selector } from '../components/Campos';
import { Barra, CargandoRejilla, ErrorEstado, Vacio } from '../components/Estados';
import ProductCard from '../components/ProductCard';
import type { Producto, Tipo } from '../types';

export default function Catalogo({ tipo }: { tipo: Tipo }) {
  const movil = tipo === 'moviles';
  const [items, setItems] = useState<Producto[] | null>(null);
  const [error, setError] = useState(false);
  const [busca, setBusca] = useState('');
  const [grupo, setGrupo] = useState('');
  const [orden, setOrden] = useState('nombre');

  const cargar = useCallback(async () => {
    setError(false);
    setItems(null);
    try {
      setItems(await api.get<Producto[]>('/' + tipo));
    } catch {
      setError(true);
    }
  }, [tipo]);

  useEffect(() => {
    setBusca('');
    setGrupo('');
    cargar();
  }, [cargar]);

  const clave = (p: Producto) => (movil ? p.marca ?? '' : p.plataforma ?? '');
  const grupos = useMemo(() => [...new Set((items ?? []).map(clave))].sort(), [items]); // eslint-disable-line react-hooks/exhaustive-deps
  const lista = useMemo(() => {
    const t = busca.trim().toLowerCase();
    const filtrada = (items ?? []).filter((p) => (!t || p.nombre.toLowerCase().includes(t)) && (!grupo || clave(p) === grupo));
    return filtrada.sort((a, b) => (orden === 'precio-asc' ? a.precio - b.precio : orden === 'precio-desc' ? b.precio - a.precio : a.nombre.localeCompare(b.nombre)));
  }, [items, busca, grupo, orden]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Barra cargando={items === null && !error} />
      <div className="contenedor pagina">
        <div className="pagina-cab">
          <div>
            <h1>{movil ? 'Móviles' : 'Videojuegos'}</h1>
            <p>{movil ? 'Los últimos modelos, con su memoria y RAM.' : 'Compra o alquila: elige tu plataforma.'}</p>
          </div>
        </div>
        <div className="filtros">
          <Campo etiqueta="Buscar por nombre" value={busca} onChange={setBusca} />
          <Selector etiqueta={movil ? 'Marca' : 'Plataforma'} value={grupo} onChange={setGrupo}>
            <option value="">Todas</option>
            {grupos.map((g) => (
              <option key={g} value={g}>{g}</option>
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
