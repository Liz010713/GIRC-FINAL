import { useCallback, useState } from 'react';
import { AuthSection } from './components/AuthSection';
import { CatalogoSection } from './components/CatalogoSection';
import { DashboardSection } from './components/DashboardSection';
import { FeedbackBanners } from './components/FeedbackBanners';
import { Navbar } from './components/Navbar';
import { PedidosSection } from './components/PedidosSection';
import { ReportesSection } from './components/ReportesSection';
import { StockAlertTray } from './components/StockAlertTray';
import { useAuthSession } from './hooks/useAuthSession';
import { useGircData } from './hooks/useGircData';
import { LoginRequest, RegistroUsuarioRequest } from './types/girc';
import './girc.css';

export function App() {
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const limpiarMensajes = useCallback(() => {
    setMensajeError(null);
    setMensajeExito(null);
  }, []);

  const {
    usuario,
    autenticando,
    esAdmin,
    puedeCrearProductos,
    puedeVerReportes,
    puedeComprar,
    iniciarSesion,
    crearCuenta,
    cerrarSesion,
  } = useAuthSession();

  const {
    productos,
    pedidos,
    cargando,
    alertasStock,
    cargarDatos,
    cerrarAlerta,
    cerrarTodasLasAlertas,
  } = useGircData({ onError: setMensajeError });

  const handleLogin = useCallback(async (payload: LoginRequest) => {
    const sesion = await iniciarSesion(payload);
    await cargarDatos('Inventario cargado al iniciar sesión');
    return sesion;
  }, [iniciarSesion, cargarDatos]);

  const handleRegistro = useCallback(async (payload: RegistroUsuarioRequest) => {
    const creado = await crearCuenta(payload);
    await cargarDatos('Inventario cargado al crear cuenta');
    return creado;
  }, [crearCuenta, cargarDatos]);

  const handleCerrarSesion = useCallback(() => {
    cerrarSesion();
    setMensajeError(null);
    setMensajeExito('Sesión cerrada correctamente.');
  }, [cerrarSesion]);

  return (
    <>
      <Navbar
        usuario={usuario}
        esAdmin={esAdmin}
        onCerrarSesion={handleCerrarSesion}
      />

      <StockAlertTray
        alertas={alertasStock}
        onCerrarAlerta={cerrarAlerta}
        onCerrarTodas={cerrarTodasLasAlertas}
      />

      <main className="container">
        <FeedbackBanners
          mensajeError={mensajeError}
          mensajeExito={mensajeExito}
          onCerrarError={() => setMensajeError(null)}
          onCerrarExito={() => setMensajeExito(null)}
        />

        <AuthSection
          usuario={usuario}
          autenticando={autenticando}
          onLogin={handleLogin}
          onRegistro={handleRegistro}
          onCerrarSesion={handleCerrarSesion}
          onExito={setMensajeExito}
          onError={setMensajeError}
          onLimpiarMensajes={limpiarMensajes}
        />

        {usuario && (
          <>
            <DashboardSection
              rol={usuario.rol}
              esAdmin={esAdmin}
              productos={productos}
              pedidos={pedidos}
              cargando={cargando}
              onActualizar={() => cargarDatos('Inventario actualizado manualmente')}
            />

            <CatalogoSection
              productos={productos}
              cargando={cargando}
              puedeCrearProductos={puedeCrearProductos}
              onRecargar={cargarDatos}
              onExito={setMensajeExito}
              onError={setMensajeError}
              onLimpiarMensajes={limpiarMensajes}
            />

            <PedidosSection
              key={usuario.id}
              usuario={usuario}
              puedeComprar={puedeComprar}
              productos={productos}
              cargando={cargando}
              onRecargar={cargarDatos}
              onExito={setMensajeExito}
              onError={setMensajeError}
              onLimpiarMensajes={limpiarMensajes}
            />

            <ReportesSection
              puedeVerReportes={puedeVerReportes}
              pedidos={pedidos}
              cargando={cargando}
              onRecargar={cargarDatos}
              onError={setMensajeError}
            />
          </>
        )}
      </main>
    </>
  );
}

export default App;
