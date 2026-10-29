import { useEffect, useRef, useState } from 'react';

// Quien pide "reducir movimiento" en su sistema no ve desplazamientos, rebotes ni vuelos
export const sinMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const conRaton = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches && !sinMovimiento();

// Cuenta desde el valor anterior hasta el nuevo con una curva suave (cifras del panel, total del carrito)
export function useContador(objetivo: number, ms = 900, decimales = 0): number {
  const [valor, setValor] = useState(0);
  const previo = useRef(0);
  useEffect(() => {
    if (sinMovimiento()) {
      setValor(objetivo);
      previo.current = objetivo;
      return;
    }
    const inicio = performance.now();
    const desde = previo.current;
    let cuadro = 0;
    const paso = (t: number) => {
      const p = Math.min(1, (t - inicio) / ms);
      const suave = 1 - Math.pow(1 - p, 3);
      setValor(desde + (objetivo - desde) * suave);
      if (p < 1) cuadro = requestAnimationFrame(paso);
      else previo.current = objetivo;
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [objetivo, ms]);
  return Number(valor.toFixed(decimales));
}

// Añade la clase "visible" cuando el elemento entra en pantalla (aparición al hacer scroll)
export function useRevelar<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (sinMovimiento() || !('IntersectionObserver' in window)) {
      el.classList.add('visible');
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('visible');
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

// La foto del producto sale volando hasta el icono del carrito, que rebota al recibirla
export function volarAlCarrito(origen: Element | null) {
  const destino = document.querySelector('.carrito-btn') as HTMLElement | null;
  if (!origen || !destino || sinMovimiento()) return;
  const a = origen.getBoundingClientRect();
  const b = destino.getBoundingClientRect();
  const clon = origen.cloneNode(true) as HTMLElement;
  Object.assign(clon.style, {
    position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`,
    margin: '0', zIndex: '5000', pointerEvents: 'none', borderRadius: '14px', objectFit: 'cover',
    boxShadow: '0 12px 30px rgba(27,36,48,.3)', viewTransitionName: 'none',
  });
  document.body.appendChild(clon);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const vuelo = clon.animate(
    [
      { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 140}px) scale(0.45) rotate(-10deg)`, opacity: 0.95, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.06) rotate(8deg)`, opacity: 0.25 },
    ],
    { duration: 800, easing: 'cubic-bezier(.45,.05,.25,1)' },
  );
  vuelo.onfinish = () => {
    clon.remove();
    destino.classList.remove('rebota');
    void destino.offsetWidth;
    destino.classList.add('rebota');
  };
}
