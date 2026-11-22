import { useMemo, useState } from 'react';
import { ApiError, crearPedido } from '../services/gircApi';
import { Producto, UsuarioSesion } from '../types/girc';
import { formatCurrency } from '../utils/formatters';

interface PedidosSectionProps {
  usuario: UsuarioSesion;
  puedeComprar: boolean;
  productos: Producto[];
  cargando: boolean;
  onRecargar: (motivoAlertas: string) => Promise<void>;
  onExito: (mensaje: string) => void;
  onError: (mensaje: string) => void;
  onLimpiarMensajes: () => void;
}

export function PedidosSection({
  usuario,
  puedeComprar,
  productos,
  cargando,
  onRecargar,
  onExito,
  onError,
  onLimpiarMensajes,
}: PedidosSectionProps) {
  const [cantidadesInput, setCantidadesInput] = useState<Record<number, number>>({});
  const [carrito, setCarrito] = useState<Record<number, number>>({});
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  const lineasCarrito = useMemo(
    () => productos
      .filter((p) => (carrito[p.id] ?? 0) > 0)
      .map((producto) => ({ producto, cantidad: carrito[producto.id] })),
    [productos, carrito],
  );

  const totalOrden = useMemo(
    () => lineasCarrito.reduce((sum, item) => sum + item.producto.precioUnitario * item.cantidad, 0),
    [lineasCarrito],
  );

  function agregarAlPedido(producto: Producto) {
    if (!puedeComprar || producto.stockActual < 1) return;
    const rawCantidad = Number(cantidadesInput[producto.id] ?? 1);
    const cantidad = Number.isNaN(rawCantidad) ? 1 : Math.max(1, Math.floor(rawCantidad));
    setCarrito((prev) => ({ ...prev, [producto.id]: cantidad }));
    onLimpiarMensajes();
  }

  function quitarDelPedido(idProducto: number) {
    setCarrito((prev) => {
      const next = { ...prev };
      delete next[idProducto];
      return next;
    });
  }

  async function handleConfirmarOrden() {
    if (!puedeComprar) {
      onError('Debes iniciar sesión antes de confirmar un pedido.');
      return;
    }
    if (lineasCarrito.length === 0 || enviandoPedido) return;

    setEnviandoPedido(true);
    onLimpiarMensajes();

    try {
      const pedidoCreado = await crearPedido({
        idUsuario: usuario.id,
        claveIdempotencia: crypto.randomUUID(),
        items: lineasCarrito.map(({ producto, cantidad }) => ({
          idProducto: producto.id,
          cantidadSolicitada: cantidad,
        })),
      });

      setCarrito({});
      setCantidadesInput({});
      onExito(
        `Compra registrada: orden ${pedidoCreado.codigoOrden} (${pedidoCreado.estado}) por ${formatCurrency(pedidoCreado.totalNeto)} · Usuario #${usuario.id}.`,
      );
      await onRecargar('Alerta actualizada tras registrar pedido');
    } catch (err) {
      onError(
        err instanceof ApiError
          ? `HTTP ${err.status}: ${err.message}`
          : 'No fue posible confirmar el pedido.',
      );
    } finally {
      setEnviandoPedido(false);
    }
  }

  return (
    <section id="pedidos" className="screen-section">
      <div className="section-header">
        <h2>Portal Comercial y Generación de Órdenes</h2>
        <span className="badge">
          Compras habilitadas · {usuario.nombreCompleto} ({usuario.rol} · ID #{usuario.id})
        </span>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio Unitario</th>
                <th>Disponible</th>
                <th>Cantidad Solicitada</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    {cargando ? 'Cargando productos…' : 'No hay productos disponibles para pedir.'}
                  </td>
                </tr>
              ) : (
                productos.map((producto) => {
                  const agotado = producto.stockActual < 1;
                  const cantidadElegida = cantidadesInput[producto.id] ?? 1;
                  const superaStock = cantidadElegida > producto.stockActual;
                  const enCarrito = carrito[producto.id] ?? 0;

                  return (
                    <tr key={producto.id}>
                      <td>
                        <strong>{producto.nombreProducto}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{producto.sku}</div>
                      </td>
                      <td>{formatCurrency(producto.precioUnitario)}</td>
                      <td>{producto.stockActual} Unidades</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={producto.stockActual > 0 ? producto.stockActual : 1}
                          value={cantidadElegida}
                          disabled={agotado}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCantidadesInput((prev) => ({
                              ...prev,
                              [producto.id]: Number.isNaN(val) ? 1 : Math.max(1, Math.floor(val)),
                            }));
                          }}
                          className="input-sm"
                          aria-label={`Cantidad solicitada de ${producto.nombreProducto}`}
                        />
                      </td>
                      <td>
                        {agotado ? (
                          <button type="button" className="btn btn-disabled" disabled>
                            Sin Stock (RN-02)
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={superaStock ? 'btn btn-secondary' : 'btn btn-success'}
                            onClick={() => agregarAlPedido(producto)}
                          >
                            {enCarrito > 0
                              ? `Actualizar (${enCarrito} en pedido)`
                              : 'Añadir al Pedido'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {lineasCarrito.length > 0 && (
          <div className="cart-summary">
            <strong>Resumen del pedido en preparación ({lineasCarrito.length} ítems)</strong>
            <ul className="cart-summary-list">
              {lineasCarrito.map(({ producto, cantidad }) => (
                <li key={producto.id}>
                  <span>
                    {producto.nombreProducto} ({cantidad} × {formatCurrency(producto.precioUnitario)})
                  </span>
                  <span>
                    <strong>{formatCurrency(producto.precioUnitario * cantidad)}</strong>{' '}
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => quitarDelPedido(producto.id)}
                      style={{ marginLeft: '0.5rem', padding: '0.2rem 0.5rem' }}
                    >
                      Quitar
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="action-footer">
          <button
            type="button"
            className="btn btn-primary btn-inline"
            disabled={lineasCarrito.length === 0 || enviandoPedido || !puedeComprar}
            onClick={() => void handleConfirmarOrden()}
          >
            {enviandoPedido
              ? 'Confirmando orden…'
              : `Confirmar Orden (${formatCurrency(totalOrden)})`}
          </button>
        </div>

        {lineasCarrito.length === 0 && (
          <p className="order-hint">
            Haz clic en <strong>Añadir al Pedido</strong> en uno o más productos para habilitar la confirmación de compra.
          </p>
        )}
      </div>
    </section>
  );
}
