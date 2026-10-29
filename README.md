# Jokoa — Web (React)

Tienda web de Jokoa y panel de administración. React 19, TypeScript, Vite y React Router. Usa la misma API
(`/ws`) que las apps de Android e Ionic, con la misma paleta de colores.

**Tienda:** catálogo de juegos y móviles con filtros, ficha, carrito, compra y alquiler, pedidos, perfil,
tiendas con mapa y soporte técnico.

**Administración** (`/admin`, solo usuarios con rol administrador): resumen, usuarios (alta, rol, contraseña,
desactivar), productos (alta, edición, baja y subida de fotos), pedidos, tickets y tiendas.

## Compilar y publicar (en la máquina de Symfony)

```bash
npm install
npm run build        # tsc + vite build, genera dist/
./desplegar.sh       # compila y copia dist/ a ~/juegalmi/web (nginx lo sirve en /)
```

nginx sirve la web en `/`, la API de Symfony en `/ws` y las fotos en `/img` y `/uploads`
(ver `docker/nginx/default.conf` del repositorio del backend).
