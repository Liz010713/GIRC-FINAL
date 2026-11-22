import { useMemo } from 'react';
import { PedidoResponse, Producto, RolUsuario } from '../types/girc';
import { formatCurrency, toIsoDay } from '../utils/formatters';

interface DashboardSectionProps {
  rol: RolUsuario;
  esAdmin: boolean;
  productos: Producto[];
  pedidos: PedidoResponse[];
  cargando: boolean;
  onActualizar: () => Promise<void>;
}

export function DashboardSection({
  rol,
  esAdmin,
  productos,
  pedidos,
  cargando,
  onActualizar,
}: DashboardSectionProps) {
  const hoyIso = toIsoDay(new Date());

  const ingresosHoy = useMemo(
    () => pedidos
      .filter((pedido) => toIsoDay(new Date(pedido.fechaCreacion)) === hoyIso)
      .reduce((acc, pedido) => acc + Number(pedido.totalNeto), 0),
    [pedidos, hoyIso],
  );

  const ingresosTotales = useMemo(
    () => pedidos.reduce((acc, pedido) => acc + Number(pedido.totalNeto), 0),
    [pedidos],
  );

  const totalAlertasStock = useMemo(
    () => productos.filter((p) => p.estado === 'Crítico' || p.estado === 'Agotado').length,
    [productos],
  );

  return (
    <section id="dashboard" className="screen-section">
      <div className="section-header">
        <h2>{esAdmin ? 'Consola de Administración' : 'Panel Comercial'}</h2>
        <div className="header-actions">
          <span className="badge">Rol: {rol}</span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void onActualizar()}
            disabled={cargando}
          >
            {cargando ? 'Actualizando…' : '↻ Actualizar'}
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Ingresos Hoy</h3>
          <p className="kpi-value">{cargando ? '—' : formatCurrency(ingresosHoy)}</p>
          <span className="kpi-note">
            Acumulado total: {cargando ? '—' : formatCurrency(ingresosTotales)}
          </span>
        </div>
        <div className="kpi-card">
          <h3>Órdenes Registradas</h3>
          <p className="kpi-value">{cargando ? '—' : `${pedidos.length} Pedidos`}</p>
          <span className="kpi-note">Persistidas en MariaDB (GIRC)</span>
        </div>
        <div className="kpi-card alert">
          <h3>Alertas Stock</h3>
          <p className="kpi-value">{cargando ? '—' : `${totalAlertasStock} Recursos`}</p>
          <span className="kpi-note">
            En estado Crítico o Agotado ({productos.length} en catálogo)
          </span>
        </div>
      </div>
    </section>
  );
}
