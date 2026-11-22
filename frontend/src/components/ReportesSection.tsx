import { useMemo, useState } from 'react';
import { PedidoResponse } from '../types/girc';
import { formatCurrency, formatDate, toIsoDay } from '../utils/formatters';

interface ReportesSectionProps {
  puedeVerReportes: boolean;
  pedidos: PedidoResponse[];
  cargando: boolean;
  onRecargar: (motivoAlertas: string) => Promise<void>;
  onError: (mensaje: string) => void;
}

export function ReportesSection({
  puedeVerReportes,
  pedidos,
  cargando,
  onRecargar,
  onError,
}: ReportesSectionProps) {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const hoyIso = toIsoDay(new Date());

  const pedidosFiltrados = useMemo(() => pedidos.filter((pedido) => {
    const dia = toIsoDay(new Date(pedido.fechaCreacion));
    if (fechaDesde && dia < fechaDesde) return false;
    if (fechaHasta && dia > fechaHasta) return false;
    return true;
  }), [pedidos, fechaDesde, fechaHasta]);

  function exportarCsv() {
    if (!puedeVerReportes) {
      onError('Permisos insuficientes: solo un ADMINISTRADOR puede exportar reportes.');
      return;
    }
    const encabezado = 'ID Orden,ID Usuario,Fecha Creacion,Total Neto,Estado';
    const filas = pedidosFiltrados.map(
      (p) => `"${p.codigoOrden}",${p.idUsuario},"${formatDate(p.fechaCreacion)}",${p.totalNeto},"${p.estado}"`,
    );
    const contenido = [encabezado, ...filas].join('\n');
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-ventas-girc-${hoyIso}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="reportes" className="screen-section">
      <div className="section-header">
        <h2>Consolidados de Auditoría y Ventas</h2>
        <span className={`badge ${puedeVerReportes ? '' : 'badge-restricted'}`}>
          {puedeVerReportes ? 'Módulo Gerencial' : 'Acceso Restringido'}
        </span>
      </div>

      {puedeVerReportes ? (
        <div className="card">
          <div className="filters-bar">
            <div>
              <label htmlFor="rep-desde">Desde:</label>
              <input
                id="rep-desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="rep-hasta">Hasta:</label>
              <input
                id="rep-hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary btn-inline"
              onClick={() => void onRecargar('Reportes actualizados desde MariaDB')}
            >
              Consultar
            </button>
            {(fechaDesde || fechaHasta) && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setFechaDesde('');
                  setFechaHasta('');
                }}
              >
                Limpiar fechas
              </button>
            )}
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Orden</th>
                  <th>ID Usuario</th>
                  <th>Fecha Creación</th>
                  <th>Total Neto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-cell">
                      {cargando
                        ? 'Cargando órdenes…'
                        : 'Aún no hay pedidos registrados para el criterio seleccionado.'}
                    </td>
                  </tr>
                ) : (
                  pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id}>
                      <td>{pedido.codigoOrden}</td>
                      <td>#{pedido.idUsuario}</td>
                      <td>{formatDate(pedido.fechaCreacion)}</td>
                      <td>{formatCurrency(pedido.totalNeto)}</td>
                      <td>
                        <span className="tag success">{pedido.estado}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="action-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={exportarCsv}
              disabled={pedidosFiltrados.length === 0}
            >
              Exportar a Excel (.CSV)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => window.print()}
            >
              Exportar a PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="restricted-box">
          <h3>Acceso restringido a Reportes y Auditoría</h3>
          <p>
            Permisos insuficientes: el módulo de consolidados de ventas y exportación es exclusivo del rol{' '}
            <strong>ADMINISTRADOR</strong>. Tu sesión actual corresponde al rol <strong>USUARIO</strong>.
          </p>
        </div>
      )}
    </section>
  );
}
