import {
  CrearPedidoRequest,
  CrearProductoRequest,
  LoginRequest,
  PedidoResponse,
  Producto,
  RegistroUsuarioRequest,
  UsuarioSesion,
} from '../types/girc';

export type {
  CrearPedidoRequest,
  CrearProductoRequest,
  LoginRequest,
  PedidoResponse,
  Producto,
  RegistroUsuarioRequest,
  RolUsuario,
  UsuarioSesion,
} from '../types/girc';

interface ErrorResponse {
  status?: number;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errorCode?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE = '/api/v1';

async function readError(response: Response, fallback: string): Promise<ApiError> {
  const body = await response.json().catch(() => null) as ErrorResponse | null;
  return new ApiError(response.status, body?.message ?? fallback, body?.error);
}

export async function loginUsuario(payload: LoginRequest): Promise<UsuarioSesion> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await readError(response, 'Credenciales inválidas.');
  return response.json() as Promise<UsuarioSesion>;
}

export async function registrarUsuario(payload: RegistroUsuarioRequest): Promise<UsuarioSesion> {
  const response = await fetch(`${API_BASE}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await readError(response, 'No fue posible registrar el usuario.');
  return response.json() as Promise<UsuarioSesion>;
}

export async function listarProductos(): Promise<Producto[]> {
  const response = await fetch(`${API_BASE}/productos`);
  if (!response.ok) throw await readError(response, 'No fue posible cargar el inventario.');
  return response.json() as Promise<Producto[]>;
}

export async function crearProducto(payload: CrearProductoRequest): Promise<Producto> {
  const response = await fetch(`${API_BASE}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await readError(response, 'No fue posible registrar el producto.');
  return response.json() as Promise<Producto>;
}

export async function listarPedidos(): Promise<PedidoResponse[]> {
  const response = await fetch(`${API_BASE}/pedidos`);
  if (!response.ok) throw await readError(response, 'No fue posible cargar los pedidos.');
  return response.json() as Promise<PedidoResponse[]>;
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
