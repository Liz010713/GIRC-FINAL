import { StockAlertItem } from '../types/girc';

interface StockAlertTrayProps {
  alertas: StockAlertItem[];
  onCerrarAlerta: (alertaId: string) => void;
  onCerrarTodas: () => void;
}

export function StockAlertTray({
  alertas,
  onCerrarAlerta,
  onCerrarTodas,
}: StockAlertTrayProps) {
  if (alertas.length === 0) return null;

  return (
    <aside className="stock-alert-tray" aria-label="Alertas de stock crítico y agotado">
      <div className="stock-alert-tray-header">
        <span>⚠ ALERTAS DE STOCK ({alertas.length})</span>
        {alertas.length > 1 && (
          <button
            type="button"
            className="stock-alert-clear-all"
            onClick={onCerrarTodas}
          >
            Cerrar todas
          </button>
        )}
      </div>
      {alertas.map((alerta) => (
        <div key={alerta.id} className="stock-alert-card" role="alert">
          <div className="stock-alert-top">
            <span className="stock-alert-pill">
              {alerta.estado === 'Agotado' ? 'AGOTADO' : 'STOCK CRÍTICO'}
            </span>
            <button
              type="button"
              className="stock-alert-close"
              onClick={() => onCerrarAlerta(alerta.id)}
              aria-label={`Cerrar alerta de ${alerta.nombreProducto}`}
            >
              ×
            </button>
          </div>
          <div className="stock-alert-title">{alerta.nombreProducto}</div>
          <div className="stock-alert-meta">
            SKU: <strong>{alerta.sku}</strong> · Restante:{' '}
            <strong>{alerta.stockActual} unid.</strong> (mín. {alerta.stockMinimo})
          </div>
          <div className="stock-alert-reason">{alerta.motivo}</div>
        </div>
      ))}
    </aside>
  );
}
