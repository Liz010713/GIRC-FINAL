import { Producto, RolUsuario, StockAlertItem } from '../types/girc';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

export function toIsoDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function estadoTagClass(estado: Producto['estado']): string {
  if (estado === 'Agotado') return 'danger';
  if (estado === 'Crítico') return 'warning';
  return 'success';
}

export function normalizarRol(rol: unknown): RolUsuario | null {
  if (typeof rol !== 'string') return null;
  const upper = rol.trim().toUpperCase();
  if (upper === 'ADMINISTRADOR' || upper === 'USUARIO') {
    return upper;
  }
  return null;
}

export function construirAlertasDeProductos(lista: Producto[], motivo: string): StockAlertItem[] {
  return lista
    .filter((p): p is Producto & { estado: 'Crítico' | 'Agotado' } =>
      p.estado === 'Crítico' || p.estado === 'Agotado',
    )
    .map((p) => ({
      id: `${p.id}-${p.stockActual}-${p.estado}`,
      productoId: p.id,
      sku: p.sku,
      nombreProducto: p.nombreProducto,
      stockActual: p.stockActual,
      stockMinimo: p.stockMinimo,
      estado: p.estado,
      motivo,
    }));
}
