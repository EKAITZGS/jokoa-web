import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api, ApiError } from '../api';
import { Barra, ErrorEstado, Vacio } from '../components/Estados';
import Icon from '../components/Icon';
import { euros, fechaCorta } from '../format';
import { useToast } from '../toast';
import type { Alquiler, Compra } from '../types';

export default function Pedidos() {
  const { state } = useLocation();
  const [compras, setCompras] = useState(state?.pestana !== 'alquileres');
  const [lista, setLista] = useState<Compra[] | Alquiler[] | null>(null);
  const [error, setError] = useState(false);
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
    cargar();
  }, [cargar]);

  const devolver = async (id: number) => {
    try {
      await api.put(`/alquileres/devolver/${id}`);
      aviso('Juego devuelto');
      cargar();
    } catch (e) {
      aviso(e instanceof ApiError ? e.message : 'No se pudo devolver');
    }
  };

  return (
    <>
      <Barra cargando={lista === null && !error} />
      <div className="contenedor pagina" style={{ maxWidth: 860 }}>
        <div className="pagina-cab"><h1>Mis pedidos</h1></div>
        <div className="pestanas" role="tablist">
          <button type="button" role="tab" aria-selected={compras} className={compras ? 'activa' : ''} onClick={() => setCompras(true)}>Compras</button>
          <button type="button" role="tab" aria-selected={!compras} className={!compras ? 'activa' : ''} onClick={() => setCompras(false)}>Alquileres</button>
        </div>
        {error ? (
          <ErrorEstado onReintentar={cargar} />
        ) : lista === null ? null : lista.length === 0 ? (
          <Vacio icono="carrito" texto={compras ? 'Todavía no has comprado nada' : 'Todavía no has alquilado nada'} />
        ) : (
          <div className="lista-filas">
            {compras
              ? (lista as Compra[]).map((c, i) => (
                  <div key={c.id} className="tarjeta fila-pedido entra" style={{ ['--i' as string]: i }}>
                    <div className="arriba">
                      <h3>Compra #{c.id} · {fechaCorta(c.fecha)}</h3>
                      <span className="derecha">{euros(c.total)}</span>
                    </div>
                    <div className="txt">{c.lineas.map((l) => `${l.cantidad} × ${l.nombre}`).join('\n')}</div>
                  </div>
                ))
              : (lista as Alquiler[]).map((a, i) => (
                  <div key={a.id} className="tarjeta fila-pedido entra" style={{ ['--i' as string]: i }}>
                    <div className="arriba">
                      <h3>{a.videojuego}</h3>
                      <span className="derecha">{euros(a.precio_dia)}/día</span>
                    </div>
                    <div className="txt">{`Del ${a.fecha_inicio} al ${a.fecha_fin}` + (a.fecha_devolucion ? `\nDevuelto el ${a.fecha_devolucion}` : '')}</div>
                    {a.fecha_devolucion ? (
                      <span className="chip exito" style={{ marginTop: 10 }}><Icon nombre="check" tam={14} />Devuelto</span>
                    ) : (
                      <div className="accion"><button className="btn coral" type="button" onClick={() => devolver(a.id)}>Devolver</button></div>
                    )}
                  </div>
                ))}
          </div>
        )}
      </div>
    </>
  );
}
