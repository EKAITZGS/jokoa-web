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
  garantias?: { meses: number; precio: number }[]; // garantía ampliada (móviles, tablets y ordenadores)
  // artículo (ordenadores, tablets y zona gaming)
  categoria?: string;
  montaje?: number;
  caracteristicas?: Record<string, unknown>;
}

export type Tipo = 'videojuegos' | 'moviles' | 'articulos';

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
  garantia_meses?: number | null;
  precio_garantia?: number;
}

export interface Compra {
  id: number;
  usuario_id: number;
  usuario?: string;
  fecha: string;
  total: number;
  tienda_id?: number | null;
  tienda?: string | null;
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
  tipo: 'soporte' | 'reparacion';
  estado: 'abierto' | 'en_proceso' | 'cerrado' | 'recibido' | 'presupuestado' | 'en_reparacion' | 'listo';
  presupuesto: number | null;
  presupuesto_aceptado: boolean | null; // null = el cliente aún no ha respondido
  fecha_apertura: string;
  fecha_cierre: string | null;
  n_mensajes: number;
  no_leidos: number;
}

export interface Mensaje {
  id: number;
  usuario_id: number;
  autor: string;
  es_admin: boolean;
  texto: string;
  fecha: string;
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
