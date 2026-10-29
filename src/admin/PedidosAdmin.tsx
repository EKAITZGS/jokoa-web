import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '../api';
import { Campo } from '../components/Campos';
import { Barra, ErrorEstado } from '../components/Estados';
import Icon from '../components/Icon';
import { euros, fechaCorta } from '../format';
import { useToast } from '../toast';
import type { Alquiler, Compra } from '../types';

export default function PedidosAdmin() {
  const [compras, setCompras] = useState(true);
  const [lista, setLista] = useState<Compra[] | Alquiler[] | null>(null);
  const [error, setError] = useState(false);
  const [busca, setBusca] = useState('');
  const aviso = useToast();

  const cargar = useCallback(async () => {
    setError(false);
    try {
      setLista(await api.get(compras ? '/compras' : '/alquileres'));
    } catch {
      setError(true);
    }
  }, [compras]);
  useEffect(() => {
    setLista(null);
    setBusca('');
    cargar();
  }, [cargar]);

  const t = busca.trim().toLowerCase();
  const visibles = useMemo(
    () => ((lista ?? []) as (Compra | Alquiler)[]).filter((x) => !t || (x.usuario ?? '').toLowerCase().includes(t) || ('videojuego' in x && x.videojuego.toLowerCase().includes(t))),
    [lista, t],
  );
  const facturado = compras ? (visibles as Compra[]).reduce((s, c) => s + c.total, 0) : 0;

  const devolver = async (id: number) => {
    try {
      await api.put(`/alquileres/devolver/${id}`);
      aviso('Alquiler marcado como devuelto');
      cargar();
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo marcar como devuelto');
    }
  };

  return (
    <>
      <Barra cargando={lista === null && !error} />
      <div className="admin-cab" style={{ marginTop: 8 }}>
        <div>
          <h1>Pedidos</h1>
          <p>Todas las compras y alquileres de los clientes.</p>
        </div>
      </div>
      <div className="pestanas" role="tablist" style={{ marginBottom: 16 }}>
        <button type="button" role="tab" aria-selected={compras} className={compras ? 'activa' : ''} onClick={() => setCompras(true)}>Compras</button>
        <button type="button" role="tab" aria-selected={!compras} className={!compras ? 'activa' : ''} onClick={() => setCompras(false)}>Alquileres</button>
      </div>
      <div className="barra-herr">
        <Campo etiqueta={compras ? 'Buscar por cliente' : 'Buscar por cliente o juego'} value={busca} onChange={setBusca} />
        {compras && lista && <span className="chip">{visibles.length} compras · {euros(facturado)}</span>}
      </div>
      {error ? (
        <ErrorEstado onReintentar={cargar} />
      ) : (
        <div className="tarjeta panel">
          <div className="tabla-caja">
            {compras ? (
              <table className="tabla">
                <thead><tr><th>Compra</th><th>Cliente</th><th>Productos</th><th className="num">Total</th></tr></thead>
                <tbody>
                  {(visibles as Compra[]).map((c) => (
                    <tr key={c.id}>
                      <td><div className="principal">#{c.id}</div><div className="secundario">{fechaCorta(c.fecha)}</div></td>
                      <td>{c.usuario ?? `Usuario ${c.usuario_id}`}</td>
                      <td><ul className="lineas">{c.lineas.map((l) => <li key={l.producto_id}>{l.cantidad} × {l.nombre} <span className="secundario">({euros(l.precio_unitario)})</span></li>)}</ul></td>
                      <td className="num principal">{euros(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="tabla">
                <thead><tr><th>Juego</th><th>Cliente</th><th>Periodo</th><th className="num">Precio/día</th><th>Estado</th><th /></tr></thead>
                <tbody>
                  {(visibles as Alquiler[]).map((a) => (
                    <tr key={a.id}>
                      <td className="principal">{a.videojuego}</td>
                      <td>{a.usuario ?? `Usuario ${a.usuario_id}`}</td>
                      <td>{a.fecha_inicio} → {a.fecha_fin}</td>
                      <td className="num">{euros(a.precio_dia)}</td>
                      <td>{a.fecha_devolucion ? <span className="chip exito"><Icon nombre="check" tam={14} />Devuelto el {a.fecha_devolucion}</span> : <span className="chip coral"><span className="punto" />En alquiler</span>}</td>
                      <td>{!a.fecha_devolucion && <div className="acciones"><button className="btn pequeno tonal" type="button" onClick={() => devolver(a.id)}>Marcar devuelto</button></div>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {lista && visibles.length === 0 && <div className="vacio-tabla">No hay pedidos.</div>}
          </div>
        </div>
      )}
    </>
  );
}
