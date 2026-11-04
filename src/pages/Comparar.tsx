import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { CATEGORIAS, euros, esArticulo, esMovil, fichaTecnica, rutaTipo } from '../format';
import { useComparar } from '../comparar';
import type { Producto } from '../types';

// Datos de cada producto como pares [dato, valor], según sea juego, móvil o artículo
function datos(p: Producto): [string, string][] {
  if (esArticulo(p)) return [['Marca', p.marca ?? ''], ['Categoría', CATEGORIAS[p.categoria ?? ''] ?? ''], ...fichaTecnica(p)];
  if (esMovil(p)) return [['Marca', p.marca ?? ''], ['Almacenamiento', `${p.almacenamiento_gb} GB`], ['RAM', `${p.ram_gb} GB`]];
  return [['Plataforma', p.plataforma ?? ''], ['Género', p.genero ?? ''], ['PEGI', String(p.pegi)], ['Alquiler por día', euros(p.precio_alquiler_dia ?? 0)]];
}

// Tabla de comparación: una columna por producto y una fila por dato (las filas son la unión de todos los datos)
export default function Comparar() {
  const { items, quitar, vaciar } = useComparar();

  if (items.length === 0) {
    return (
      <div className="contenedor pagina">
        <div className="estado-centro">
          <h1>Comparador</h1>
          <p>Elige de 2 a 3 productos con el botón de comparar de cada tarjeta.</p>
          <Link className="btn" to="/ordenadores">Ver la tienda</Link>
        </div>
      </div>
    );
  }

  const mapas = items.map((p) => new Map(datos(p)));
  const filas = [...new Set(items.flatMap((p) => datos(p).map(([k]) => k)))];
  const mejor = Math.min(...items.map((p) => p.precio));

  return (
    <div className="contenedor pagina">
      <div className="pagina-cab">
        <div>
          <h1>Comparador</h1>
          <p>{items.length === 1 ? 'Añade otro producto para compararlo.' : `${items.length} productos`}</p>
        </div>
        <button className="btn fantasma" type="button" onClick={vaciar}>Vaciar</button>
      </div>
      <div className="tarjeta comparador">
        <table>
          <thead>
            <tr>
              <th />
              {items.map((p) => (
                <th key={p.id}>
                  <Link to={`/producto/${rutaTipo(p)}/${p.id}`} className="comp-prod">
                    <img src={p.imagenes[0]} alt="" />
                    <span>{p.nombre}</span>
                  </Link>
                  <button className="icono-btn" type="button" aria-label={`Quitar ${p.nombre}`} onClick={() => quitar(p.id)}><Icon nombre="cerrar" tam={20} /></button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="dato">Precio</td>
              {items.map((p) => (
                <td key={p.id}>
                  <b>{euros(p.precio)}</b>
                  {items.length > 1 && p.precio === mejor && <span className="chip exito" style={{ marginLeft: 8 }}>Mejor precio</span>}
                </td>
              ))}
            </tr>
            <tr>
              <td className="dato">Disponibilidad</td>
              {items.map((p) => <td key={p.id}>{p.stock > 0 ? `${p.stock} en stock` : 'Sin stock'}</td>)}
            </tr>
            {filas.map((k) => (
              <tr key={k}>
                <td className="dato">{k}</td>
                {mapas.map((m, i) => <td key={items[i].id}>{m.get(k) ?? '—'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
