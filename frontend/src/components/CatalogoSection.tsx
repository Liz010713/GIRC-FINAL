import { FormEvent, useMemo, useState } from 'react';
import { ApiError, crearProducto } from '../services/gircApi';
import { Producto } from '../types/girc';
import { estadoTagClass, formatCurrency } from '../utils/formatters';

interface CatalogoSectionProps {
  productos: Producto[];
  cargando: boolean;
  puedeCrearProductos: boolean;
  onRecargar: (motivoAlertas: string) => Promise<void>;
  onExito: (mensaje: string) => void;
  onError: (mensaje: string) => void;
  onLimpiarMensajes: () => void;
}

export function CatalogoSection({
  productos,
  cargando,
  puedeCrearProductos,
  onRecargar,
  onExito,
  onError,
  onLimpiarMensajes,
}: CatalogoSectionProps) {
  const [sku, setSku] = useState('');
  const [nombreProducto, setNombreProducto] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [stockActual, setStockActual] = useState('10');
  const [stockMinimo, setStockMinimo] = useState('5');
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('');

  const productosFiltrados = useMemo(() => {
    const q = busquedaCatalogo.trim().toLocaleLowerCase('es');
    if (!q) return productos;
    return productos.filter((p) =>
      `${p.sku} ${p.nombreProducto} ${p.estado}`.toLocaleLowerCase('es').includes(q),
    );
  }, [productos, busquedaCatalogo]);

  async function handleRegistrarProducto(event: FormEvent) {
    event.preventDefault();
    if (!puedeCrearProductos) {
      onError('Permisos insuficientes: solo un usuario con rol ADMINISTRADOR puede crear productos.');
      return;
    }
    if (guardandoProducto) return;

    setGuardandoProducto(true);
    onLimpiarMensajes();

    try {
      const nuevo = await crearProducto({
        sku: sku.trim(),
        nombreProducto: nombreProducto.trim(),
        precioUnitario: Number(precioUnitario),
        stockActual: Number(stockActual),
        stockMinimo: Number(stockMinimo),
      });

      setSku('');
      setNombreProducto('');
      setPrecioUnitario('');
      setStockActual('10');
      setStockMinimo('5');
      onExito(
        `Producto "${nuevo.nombreProducto}" (${nuevo.sku}) guardado en MariaDB con estado ${nuevo.estado}.`,
      );
      await onRecargar(
        nuevo.estado === 'Crítico' || nuevo.estado === 'Agotado'
          ? `Nuevo producto creado en estado ${nuevo.estado}`
          : 'Inventario actualizado tras registro de producto',
      );
    } catch (err) {
      onError(
        err instanceof ApiError
          ? `HTTP ${err.status}: ${err.message}`
          : 'No fue posible registrar el producto.',
      );
    } finally {
      setGuardandoProducto(false);
    }
  }

  return (
    <section id="catalogo" className="screen-section">
      <div className="section-header">
        <h2>Gestión de Catálogo e Inventario</h2>
        <div className="header-actions">
          <span className="badge">
            {puedeCrearProductos
              ? 'Módulo Almacén · Lectura y Creación'
              : 'Catálogo Disponible · Solo Lectura'}
          </span>
          {!puedeCrearProductos && (
            <a href="#pedidos" className="btn btn-success" style={{ textDecoration: 'none' }}>
              Realizar Pedido →
            </a>
          )}
        </div>
      </div>

      {!puedeCrearProductos && (
        <div className="restricted-box">
          <h3>Creación de nuevos productos exclusiva de ADMINISTRADOR</h3>
          <p>
            Con tu rol <strong>USUARIO</strong> puedes consultar todo el catálogo y realizar compras/pedidos en la sección{' '}
            <strong>Pedidos</strong>. La creación de nuevos artículos en inventario está reservada para el rol{' '}
            <strong>ADMINISTRADOR</strong>.
          </p>
        </div>
      )}

      <div className={puedeCrearProductos ? 'grid-2col' : undefined}>
        {puedeCrearProductos && (
          <div className="card">
            <h3>Nuevo Artículo (RN-01)</h3>
            <form onSubmit={(e) => void handleRegistrarProducto(e)}>
              <div className="form-group">
                <label htmlFor="prod-sku">Código SKU</label>
                <input
                  id="prod-sku"
                  type="text"
                  placeholder="Ej. TAL-001"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="prod-nombre">Nombre del Producto</label>
                <input
                  id="prod-nombre"
                  type="text"
                  placeholder="Ej. Taladro Percutor"
                  value={nombreProducto}
                  onChange={(e) => setNombreProducto(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="prod-precio">Precio Unitario (COP)</label>
                <input
                  id="prod-precio"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Ej. 185000"
                  value={precioUnitario}
                  onChange={(e) => setPrecioUnitario(e.target.value)}
                  required
                />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="prod-stock">Stock Inicial (≥ 0)</label>
                  <input
                    id="prod-stock"
                    type="number"
                    min="0"
                    value={stockActual}
                    onChange={(e) => setStockActual(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prod-minimo">Stock Mínimo (≥ 1)</label>
                  <input
                    id="prod-minimo"
                    type="number"
                    min="1"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={guardandoProducto}>
                {guardandoProducto ? 'Registrando…' : 'Registrar Producto'}
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <h3>Existencias en Bodega</h3>
          <div className="inventory-toolbar">
            <input
              type="search"
              className="search-input"
              placeholder="Buscar por SKU, nombre o estado…"
              value={busquedaCatalogo}
              onChange={(e) => setBusquedaCatalogo(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => void onRecargar('Inventario actualizado desde MariaDB')}
              disabled={cargando}
            >
              ↻
            </button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={5} className="empty-cell">
                      Cargando inventario desde MariaDB…
                    </td>
                  </tr>
                ) : productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-cell">
                      No hay productos que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  productosFiltrados.map((producto) => (
                    <tr key={producto.id}>
                      <td>{producto.sku}</td>
                      <td>{producto.nombreProducto}</td>
                      <td>{formatCurrency(producto.precioUnitario)}</td>
                      <td>{producto.stockActual}</td>
                      <td>
                        <span className={`tag ${estadoTagClass(producto.estado)}`}>
                          {producto.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
