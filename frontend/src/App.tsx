import { useEffect, useMemo, useState } from 'react';
import {
  ApiError,
  crearPedido,
  listarProductos,
  PedidoResponse,
  Producto,
} from './services/gircApi';
import './girc.css';

type StockFilter = 'todos' | 'disponibles' | 'criticos' | 'agotados';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function stockTone(estado: string): string {
  if (estado === 'Agotado') return 'stock-empty';
  if (estado === 'Crítico') return 'stock-low';
  return 'stock-ready';
}

export function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [busqueda, setBusqueda] = useState('');
  const [filtroStock, setFiltroStock] = useState<StockFilter>('todos');
  const [idUsuario, setIdUsuario] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidoCreado, setPedidoCreado] = useState<PedidoResponse | null>(null);

  async function cargarProductos() {
    setCargando(true);
    setError(null);
    try {
      setProductos(await listarProductos());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible cargar el inventario.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargarProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es');
    return productos.filter((producto) => {
      const coincideTexto = `${producto.nombreProducto} ${producto.sku}`
        .toLocaleLowerCase('es')
        .includes(texto);
      const coincideStock = filtroStock === 'todos'
        || (filtroStock === 'disponibles' && producto.estado === 'Disponible')
        || (filtroStock === 'criticos' && producto.estado === 'Crítico')
        || (filtroStock === 'agotados' && producto.estado === 'Agotado');
      return coincideTexto && coincideStock;
    });
  }, [productos, busqueda, filtroStock]);

  const lineasPedido = useMemo(() => productos
    .filter((producto) => (cantidades[producto.id] ?? 0) > 0)
    .map((producto) => ({ producto, cantidad: cantidades[producto.id] })), [productos, cantidades]);

  const totalPedido = lineasPedido.reduce(
    (total, linea) => total + linea.producto.precioUnitario * linea.cantidad,
    0,
  );
  const unidadesPedido = lineasPedido.reduce((total, linea) => total + linea.cantidad, 0);
  const disponibles = productos.filter((producto) => producto.estado === 'Disponible').length;
  const criticos = productos.filter((producto) => producto.estado === 'Crítico').length;

  function cambiarCantidad(producto: Producto, cantidad: number) {
    const segura = Math.max(0, Math.min(producto.stockActual, cantidad));
    setCantidades((actuales) => ({ ...actuales, [producto.id]: segura }));
  }

  async function confirmarPedido() {
    if (lineasPedido.length === 0 || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      const pedido = await crearPedido({
        idUsuario,
        claveIdempotencia: crypto.randomUUID(),
        items: lineasPedido.map(({ producto, cantidad }) => ({
          idProducto: producto.id,
          cantidadSolicitada: cantidad,
        })),
      });
      setPedidoCreado(pedido);
      setCantidades({});
      await cargarProductos();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No fue posible registrar el pedido.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#inicio" aria-label="GIRC, inicio">
          <span className="brand-mark">G</span>
          <span>GIRC</span>
        </a>
        <div className="sidebar-caption">GESTIÓN COMERCIAL</div>
        <nav className="primary-nav" aria-label="Navegación principal">
          <a className="nav-item nav-active" href="#inventario">
            <span className="nav-icon" aria-hidden="true">▦</span>
            Inventario
          </a>
          <a className="nav-item" href="#pedido">
            <span className="nav-icon" aria-hidden="true">＋</span>
            Nuevo pedido
            {unidadesPedido > 0 && <span className="nav-count">{unidadesPedido}</span>}
          </a>
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" />
          <span>Operación local</span>
          <span className="version-label">v1.0</span>
        </div>
      </aside>

      <main className="main-area" id="inicio">
        <header className="topbar">
          <div className="breadcrumb">GIRC <span>/</span> Inventario</div>
          <label className="user-field" htmlFor="user-id">
            <span>Usuario</span>
            <input
              id="user-id"
              type="number"
              min="1"
              value={idUsuario}
              onChange={(event) => setIdUsuario(Math.max(1, Number(event.target.value)))}
              aria-label="Identificador del usuario"
            />
          </label>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">CONTROL DE RECURSOS</p>
              <h1>Inventario y pedidos</h1>
              <p className="page-description">Consulta existencias y prepara pedidos desde un solo lugar.</p>
            </div>
            <button type="button" className="refresh-button" onClick={() => void cargarProductos()} disabled={cargando}>
              <span aria-hidden="true">↻</span> Actualizar
            </button>
          </section>

          <section className="metric-strip" aria-label="Resumen de inventario">
            <div className="metric">
              <span className="metric-label">Referencias registradas</span>
              <strong>{cargando ? '—' : productos.length}</strong>
              <span className="metric-note">SKU en catálogo</span>
            </div>
            <div className="metric">
              <span className="metric-label">Disponibles</span>
              <strong>{cargando ? '—' : disponibles}</strong>
              <span className="metric-note">Sobre nivel mínimo</span>
            </div>
            <div className="metric metric-warning">
              <span className="metric-label">Stock crítico</span>
              <strong>{cargando ? '—' : criticos}</strong>
              <span className="metric-note">Revisar reposición</span>
            </div>
            <div className="metric metric-cart">
              <span className="metric-label">Pedido en preparación</span>
              <strong>{unidadesPedido} <small>unid.</small></strong>
              <span className="metric-note">{formatCurrency(totalPedido)} estimado</span>
            </div>
          </section>

          {error && (
            <div className="alert alert-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} aria-label="Cerrar error">×</button>
            </div>
          )}

          {pedidoCreado && (
            <section className="order-success" aria-live="polite">
              <div className="success-check" aria-hidden="true">✓</div>
              <div className="success-copy">
                <strong>Pedido registrado</strong>
                <span>{pedidoCreado.codigoOrden} · Estado {pedidoCreado.estado} · {formatCurrency(pedidoCreado.totalNeto)}</span>
              </div>
              <button type="button" onClick={() => setPedidoCreado(null)} aria-label="Cerrar confirmación">×</button>
            </section>
          )}

          <div className="workspace-grid">
            <section className="inventory-section" id="inventario">
              <div className="section-heading">
                <div>
                  <h2>Productos</h2>
                  <p>{productosFiltrados.length} referencias en vista</p>
                </div>
                <div className="filters">
                  <label className="search-box" htmlFor="product-search">
                    <span aria-hidden="true">⌕</span>
                    <input
                      id="product-search"
                      type="search"
                      placeholder="Buscar por nombre o SKU"
                      value={busqueda}
                      onChange={(event) => setBusqueda(event.target.value)}
                    />
                  </label>
                  <select
                    aria-label="Filtrar por estado del stock"
                    value={filtroStock}
                    onChange={(event) => setFiltroStock(event.target.value as StockFilter)}
                  >
                    <option value="todos">Todo el stock</option>
                    <option value="disponibles">Disponible</option>
                    <option value="criticos">Crítico</option>
                    <option value="agotados">Agotado</option>
                  </select>
                </div>
              </div>

              {cargando ? (
                <div className="product-list" aria-label="Cargando inventario">
                  {[1, 2, 3].map((item) => <div className="product-skeleton" key={item} />)}
                </div>
              ) : productosFiltrados.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-symbol" aria-hidden="true">∅</span>
                  <strong>{productos.length === 0 ? 'No hay productos registrados' : 'No encontramos productos'}</strong>
                  <p>{productos.length === 0 ? 'Comprueba que el backend esté disponible y tenga productos en el catálogo.' : 'Prueba con otro término o filtro.'}</p>
                  {productos.length === 0 && <button type="button" className="text-button" onClick={() => void cargarProductos()}>Reintentar</button>}
                </div>
              ) : (
                <div className="product-list">
                  {productosFiltrados.map((producto) => {
                    const cantidad = cantidades[producto.id] ?? 0;
                    const agotado = producto.stockActual < 1;
                    return (
                      <article className="product-row" key={producto.id}>
                        <div className="product-avatar" aria-hidden="true">{producto.nombreProducto.slice(0, 1).toLocaleUpperCase('es')}</div>
                        <div className="product-info">
                          <h3>{producto.nombreProducto}</h3>
                          <span className="product-sku">{producto.sku}</span>
                        </div>
                        <div className="product-stock">
                          <span className="stock-number">{producto.stockActual}</span>
                          <span className="stock-unit">en existencia</span>
                        </div>
                        <span className={`stock-badge ${stockTone(producto.estado)}`}>
                          <span className="badge-dot" />{producto.estado}
                        </span>
                        <div className="product-price">{formatCurrency(producto.precioUnitario)}</div>
                        <div className="quantity-control" aria-label={`Cantidad de ${producto.nombreProducto}`}>
                          <button type="button" onClick={() => cambiarCantidad(producto, cantidad - 1)} disabled={cantidad === 0} aria-label={`Quitar una unidad de ${producto.nombreProducto}`}>−</button>
                          <output>{cantidad}</output>
                          <button type="button" onClick={() => cambiarCantidad(producto, cantidad + 1)} disabled={agotado || cantidad >= producto.stockActual} aria-label={`Agregar una unidad de ${producto.nombreProducto}`}>+</button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <aside className="order-panel" id="pedido">
              <div className="order-panel-heading">
                <div>
                  <p className="eyebrow">VENTA</p>
                  <h2>Nuevo pedido</h2>
                </div>
                <span className="order-count">{lineasPedido.length}</span>
              </div>
              {lineasPedido.length === 0 ? (
                <div className="cart-empty">
                  <span aria-hidden="true">＋</span>
                  <p>Selecciona productos del inventario para armar el pedido.</p>
                </div>
              ) : (
                <div className="cart-lines">
                  {lineasPedido.map(({ producto, cantidad }) => (
                    <div className="cart-line" key={producto.id}>
                      <div>
                        <strong>{producto.nombreProducto}</strong>
                        <span>{cantidad} × {formatCurrency(producto.precioUnitario)}</span>
                      </div>
                      <b>{formatCurrency(cantidad * producto.precioUnitario)}</b>
                    </div>
                  ))}
                </div>
              )}
              <div className="order-total">
                <span>Total neto</span>
                <strong>{formatCurrency(totalPedido)}</strong>
              </div>
              <button
                type="button"
                className="submit-order"
                disabled={lineasPedido.length === 0 || enviando || cargando}
                onClick={() => void confirmarPedido()}
              >
                {enviando ? 'Registrando pedido…' : 'Crear pedido'}
                {!enviando && <span aria-hidden="true">→</span>}
              </button>
              <p className="order-footnote">El stock se valida y descuenta al confirmar.</p>
            </aside>
          </div>
          <footer className="page-footer">GIRC · Gestión Integral de Recursos y Comercialización</footer>
        </div>
      </main>
    </div>
  );
}

export default App;
