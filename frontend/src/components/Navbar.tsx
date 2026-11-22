import { UsuarioSesion } from '../types/girc';

const LOGO_URL =
  'https://img.magnific.com/vector-premium/hombre-esta-pie-flecha-azul-que-apunta-arriba-desarrollar-logotipo-minimalista-firma-consultoria-financiera-que-transmita-confianza-profesionalismo_538213-49623.jpg?semt=ais_hybrid&w=740&q=80';

interface NavbarProps {
  usuario: UsuarioSesion | null;
  esAdmin: boolean;
  onCerrarSesion: () => void;
}

export function Navbar({ usuario, esAdmin, onCerrarSesion }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="logo" aria-label="Logotipo de GIRC">
        <img src={LOGO_URL} alt="Logo de GIRC" />
        <span>GIRC</span>
      </div>

      <nav className="nav-links" aria-label="Navegación principal">
        <a href="#login">{usuario ? 'Cuenta' : 'Login'}</a>
        {usuario && (
          <>
            <a href="#dashboard">Dashboard</a>
            <a href="#catalogo">Catálogo</a>
            <a href="#pedidos">Pedidos</a>
            <a href="#reportes">Reportes</a>
          </>
        )}
      </nav>

      {usuario && (
        <div className="nav-user-bar">
          <div className="nav-user-pill">
            <span>{usuario.nombreCompleto}</span>
            <span className={`nav-role-badge ${esAdmin ? 'admin' : ''}`}>
              {usuario.rol}
            </span>
          </div>
          <button type="button" className="btn-logout" onClick={onCerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
}
