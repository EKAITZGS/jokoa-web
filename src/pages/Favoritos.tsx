import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Barra, CargandoRejilla, ErrorEstado } from '../components/Estados';
import ProductCard from '../components/ProductCard';
import { useFavoritos } from '../favoritos';
import type { Producto } from '../types';

// Los productos con corazón; si se quita uno aquí, desaparece de la lista al momento
export default function Favoritos() {
  const { ids } = useFavoritos();
  const [todos, setTodos] = useState<Producto[] | null>(null);
  const [error, setError] = useState(false);

  const cargar = useCallback(async () => {
    setError(false);
    try {
      const [j, m, a] = await Promise.all([api.get<Producto[]>('/videojuegos'), api.get<Producto[]>('/moviles'), api.get<Producto[]>('/articulos')]);
      setTodos([...j, ...m, ...a]);
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => {
    cargar();
  }, [cargar]);

  const lista = (todos ?? []).filter((p) => ids.has(p.id));

  return (
    <>
      <Barra cargando={todos === null && !error} />
      <div className="contenedor pagina">
        <div className="pagina-cab">
          <div>
            <h1>Mis favoritos</h1>
            <p>{todos && `${lista.length} ${lista.length === 1 ? 'producto' : 'productos'}`}</p>
          </div>
        </div>
        {error ? (
          <ErrorEstado onReintentar={cargar} />
        ) : todos === null ? (
          <CargandoRejilla />
        ) : lista.length === 0 ? (
          <div className="estado-centro">
            <h2>Aún no tienes favoritos</h2>
            <p>Pulsa el corazón de un producto para guardarlo aquí.</p>
            <Link className="btn" to="/juegos">Ver la tienda</Link>
          </div>
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
