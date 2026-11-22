import { FormEvent, useState } from 'react';
import { ApiError } from '../services/gircApi';
import { LoginRequest, RegistroUsuarioRequest, RolUsuario, UsuarioSesion } from '../types/girc';

interface AuthSectionProps {
  usuario: UsuarioSesion | null;
  autenticando: boolean;
  onLogin: (payload: LoginRequest) => Promise<UsuarioSesion>;
  onRegistro: (payload: RegistroUsuarioRequest) => Promise<UsuarioSesion>;
  onCerrarSesion: () => void;
  onExito: (mensaje: string) => void;
  onError: (mensaje: string) => void;
  onLimpiarMensajes: () => void;
}

export function AuthSection({
  usuario,
  autenticando,
  onLogin,
  onRegistro,
  onCerrarSesion,
  onExito,
  onError,
  onLimpiarMensajes,
}: AuthSectionProps) {
  const [modoAuth, setModoAuth] = useState<'login' | 'registro'>('login');
  const [loginEmail, setLoginEmail] = useState('admin@girc.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRol, setRegRol] = useState<RolUsuario>('USUARIO');

  async function handleLoginSubmit(event: FormEvent) {
    event.preventDefault();
    if (autenticando) return;
    onLimpiarMensajes();

    try {
      const sesion = await onLogin({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      setLoginPassword('');
      onExito(`Bienvenido, ${sesion.nombreCompleto} (Rol: ${sesion.rol}).`);
    } catch (err) {
      onError(
        err instanceof ApiError
          ? `HTTP ${err.status}: ${err.message}`
          : 'No fue posible iniciar sesión.',
      );
    }
  }

  async function handleRegistroSubmit(event: FormEvent) {
    event.preventDefault();
    if (autenticando) return;
    onLimpiarMensajes();

    try {
      const creado = await onRegistro({
        nombreCompleto: regNombre.trim(),
        email: regEmail.trim(),
        password: regPassword,
        rol: regRol,
      });
      setRegNombre('');
      setRegEmail('');
      setRegPassword('');
      setModoAuth('login');
      onExito(
        `Cuenta creada en MariaDB para ${creado.nombreCompleto} (${creado.email}) con rol ${creado.rol}. Sesión iniciada.`,
      );
    } catch (err) {
      onError(
        err instanceof ApiError
          ? `HTTP ${err.status}: ${err.message}`
          : 'No fue posible registrar el usuario.',
      );
    }
  }

  return (
    <section id="login" className="screen-section">
      <div className="card login-card">
        <h2>{usuario ? 'Sesión Activa' : 'Portal de Acceso'}</h2>
        <p className="subtitle">
          Autenticación real contra MariaDB con control de roles (ADMINISTRADOR / USUARIO)
        </p>

        {usuario ? (
          <div>
            <div className="session-pill">
              <div><strong>Usuario:</strong> {usuario.nombreCompleto}</div>
              <div><strong>Correo:</strong> {usuario.email}</div>
              <div><strong>Rol:</strong> {usuario.rol} (ID #{usuario.id})</div>
            </div>
            <div className="action-footer" style={{ justifyContent: 'center' }}>
              <a href="#pedidos" className="btn btn-success" style={{ textDecoration: 'none' }}>
                Ir a Comprar / Pedidos
              </a>
              <button type="button" className="btn btn-logout" onClick={onCerrarSesion}>
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={modoAuth === 'login'}
                className={`auth-tab ${modoAuth === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setModoAuth('login');
                  onLimpiarMensajes();
                }}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={modoAuth === 'registro'}
                className={`auth-tab ${modoAuth === 'registro' ? 'active' : ''}`}
                onClick={() => {
                  setModoAuth('registro');
                  onLimpiarMensajes();
                }}
              >
                Crear cuenta
              </button>
            </div>

            {modoAuth === 'login' ? (
              <form onSubmit={(e) => void handleLoginSubmit(e)}>
                <div className="form-group">
                  <label htmlFor="login-email">Correo Electrónico</label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="admin@girc.com o usuario@girc.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="login-pass">Contraseña</label>
                  <input
                    id="login-pass"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={autenticando}>
                  {autenticando ? 'Validando…' : 'Iniciar Sesión'}
                </button>
              </form>
            ) : (
              <form onSubmit={(e) => void handleRegistroSubmit(e)}>
                <div className="form-group">
                  <label htmlFor="reg-nombre">Nombre Completo</label>
                  <input
                    id="reg-nombre"
                    type="text"
                    placeholder="Ej. Laura Gómez"
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-email">Correo Electrónico</label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="Ej. laura@girc.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-pass">Contraseña (mín. 6 caracteres)</label>
                  <input
                    id="reg-pass"
                    type="password"
                    minLength={6}
                    placeholder="Crea una contraseña segura"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-rol">Rol de Acceso</label>
                  <select
                    id="reg-rol"
                    value={regRol}
                    onChange={(e) => setRegRol(e.target.value as RolUsuario)}
                  >
                    <option value="USUARIO">Usuario (Cliente / Operador comercial)</option>
                    <option value="ADMINISTRADOR">Administrador (Acceso total)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={autenticando}>
                  {autenticando ? 'Registrando…' : 'Registrar Nuevo Usuario'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
}
