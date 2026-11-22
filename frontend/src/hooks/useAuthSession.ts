import { useCallback, useState } from 'react';
import { loginUsuario, registrarUsuario } from '../services/gircApi';
import { LoginRequest, RegistroUsuarioRequest, UsuarioSesion } from '../types/girc';
import { normalizarRol } from '../utils/formatters';

const STORAGE_SESSION_KEY = 'girc_usuario_sesion';

function leerSesionGuardada(): UsuarioSesion | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UsuarioSesion>;
    const rol = normalizarRol(parsed.rol);
    if (typeof parsed.id === 'number' && typeof parsed.email === 'string' && rol) {
      return {
        id: parsed.id,
        nombreCompleto: parsed.nombreCompleto ?? parsed.email,
        email: parsed.email,
        rol,
        fechaCreacion: parsed.fechaCreacion ?? '',
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function useAuthSession() {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => leerSesionGuardada());
  const [autenticando, setAutenticando] = useState(false);

  const rolActivo = normalizarRol(usuario?.rol);
  const esAdmin = rolActivo === 'ADMINISTRADOR';
  const puedeCrearProductos = esAdmin;
  const puedeVerReportes = esAdmin;
  const puedeComprar = usuario !== null;

  const guardarSesion = useCallback((sesion: UsuarioSesion | null) => {
    if (sesion) {
      const limpia: UsuarioSesion = {
        ...sesion,
        rol: normalizarRol(sesion.rol) ?? 'USUARIO',
      };
      setUsuario(limpia);
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(limpia));
    } else {
      setUsuario(null);
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
  }, []);

  const iniciarSesion = useCallback(async (payload: LoginRequest): Promise<UsuarioSesion> => {
    setAutenticando(true);
    try {
      const sesion = await loginUsuario(payload);
      guardarSesion(sesion);
      return sesion;
    } finally {
      setAutenticando(false);
    }
  }, [guardarSesion]);

  const crearCuenta = useCallback(async (payload: RegistroUsuarioRequest): Promise<UsuarioSesion> => {
    setAutenticando(true);
    try {
      const creado = await registrarUsuario(payload);
      guardarSesion(creado);
      return creado;
    } finally {
      setAutenticando(false);
    }
  }, [guardarSesion]);

  const cerrarSesion = useCallback(() => {
    guardarSesion(null);
  }, [guardarSesion]);

  return {
    usuario,
    autenticando,
    esAdmin,
    puedeCrearProductos,
    puedeVerReportes,
    puedeComprar,
    iniciarSesion,
    crearCuenta,
    cerrarSesion,
  };
}
