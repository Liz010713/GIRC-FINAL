export interface Producto {
  id: number;
  sku: string;
  nombreProducto: string;
  precioUnitario: number;
  stockActual: number;
  stockMinimo: number;
  estado: 'Disponible' | 'Crítico' | 'Agotado';
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

interface ErrorResponse {
  message?: string;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE = '/api/v1';

async function readError(response: Response, fallback: string): Promise<ApiError> {
  const body = await response.json().catch(() => null) as ErrorResponse | null;
  return new ApiError(response.status, body?.message ?? fallback);
}

export async function listarProductos(): Promise<Producto[]> {
  const response = await fetch(`${API_BASE}/productos`);
  if (!response.ok) throw await readError(response, 'No fue posible cargar el inventario.');
  return response.json() as Promise<Producto[]>;
}

export async function crearPedido(payload: CrearPedidoRequest): Promise<PedidoResponse> {
  const response = await fetch(`${API_BASE}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await readError(response, 'No fue posible registrar el pedido.');
  return response.json() as Promise<PedidoResponse>;
}