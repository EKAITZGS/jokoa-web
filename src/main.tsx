import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'leaflet/dist/leaflet.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth';
import { CartProvider } from './cart';
import { NotifProvider } from './notificaciones';
import { ToastProvider } from './toast';
import './styles/tokens.css';
import './styles/base.css';
import './styles/tienda.css';
import './styles/admin.css';
import './styles/animaciones.css';
import { sinMovimiento } from './efectos';

// Onda al pulsar botones: nace en el punto exacto del clic
document.addEventListener('pointerdown', (e) => {
  const b = (e.target as HTMLElement).closest('.btn, .icono-btn, .carrito-btn') as HTMLElement | null;
  if (!b || (b as HTMLButtonElement).disabled || sinMovimiento()) return;
  const r = b.getBoundingClientRect();
  const lado = Math.max(r.width, r.height);
  const onda = document.createElement('span');
  onda.className = 'onda';
  onda.style.cssText = `width:${lado}px;height:${lado}px;left:${e.clientX - r.left - lado / 2}px;top:${e.clientY - r.top - lado / 2}px`;
  b.appendChild(onda);
  onda.addEventListener('animationend', () => onda.remove());
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NotifProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </NotifProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
