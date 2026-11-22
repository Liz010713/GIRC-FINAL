export type RolUsuario = 'ADMINISTRADOR' | 'USUARIO';

export interface UsuarioSesion {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: RolUsuario;
  fechaCreacion: string;
}

export interface RegistroUsuarioRequest {
  nombreCompleto: string;
  email: string;
  password: string;
  rol: RolUsuario;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Producto {
  id: number;
  sku: string;
  nombreProducto: string;
  precioUnitario: number;
  stockActual: number;
  stockMinimo: number;
  estado: 'Disponible' | 'Crítico' | 'Agotado';
}

export interface CrearProductoRequest {
  sku: string;
  nombreProducto: string;
  precioUnitario: number;
  stockActual: number;
  stockMinimo: number;
}

export interface CrearPedidoRequest {
  idUsuario: number;
  claveIdempotencia: string;
  items: Array<{
    idProducto: number;
    cantidadSolicitada: number;
  }>;
}

export interface PedidoResponse {
  id: number;
  codigoOrden: string;
  idUsuario: number;
  totalNeto: number;
  estado: string;
  fechaCreacion: string;
}

export interface StockAlertItem {
  id: string;
  productoId: number;
  sku: string;
  nombreProducto: string;
  stockActual: number;
  stockMinimo: number;
  estado: 'Crítico' | 'Agotado';
  motivo: string;
}
