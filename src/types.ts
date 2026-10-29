export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenes: string[];
  // videojuego
  plataforma_id?: number;
  plataforma?: string;
  genero?: string;
  pegi?: number;
  precio_alquiler_dia?: number;
  // móvil
  marca?: string;
  almacenamiento_gb?: number;
  ram_gb?: number;
}

export type Tipo = 'videojuegos' | 'moviles';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  telefono: string | null;
  roles: string[];
}

export interface UsuarioAdmin {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  telefono: string | null;
  rol: 'admin' | 'usuario';
  activo: boolean;
  fecha_alta: string;
}

export interface Linea {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Compra {
  id: number;
  usuario_id: number;
  usuario?: string;
  fecha: string;
  total: number;
  lineas: Linea[];
}

export interface Alquiler {
  id: number;
  usuario_id: number;
  usuario?: string;
  videojuego_id: number;
  videojuego: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_devolucion: string | null;
  precio_dia: number;
}

export interface Ticket {
  id: number;
  usuario_id: number;
  usuario?: string;
  departamento_id: number;
  departamento: string;
  asunto: string;
  descripcion: string;
  dispositivo: string;
  estado: 'abierto' | 'en_proceso' | 'cerrado';
  fecha_apertura: string;
  fecha_cierre: string | null;
}

export interface Tienda {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  horario: string;
  latitud: number;
  longitud: number;
}

export interface Resumen {
  usuarios: number;
  usuarios_activos: number;
  videojuegos: number;
  moviles: number;
  compras: number;
  ingresos: number;
  alquileres_activos: number;
  tickets_abiertos: number;
  stock_bajo: number;
}
