import { useCallback, useEffect, useState } from 'react';
import { listarPedidos, listarProductos } from '../services/gircApi';
import { PedidoResponse, Producto, StockAlertItem } from '../types/girc';
import { construirAlertasDeProductos } from '../utils/formatters';

interface UseGircDataOptions {
  onError: (mensaje: string) => void;
}

export function useGircData({ onError }: UseGircDataOptions) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos] = useState<PedidoResponse[]>([]);
  const [cargando, setCargando] = useState(true);
  const [alertasStock, setAlertasStock] = useState<StockAlertItem[]>([]);

  const cargarDatos = useCallback(async (motivoAlertas = 'Detectado al consultar inventario en MariaDB') => {
    setCargando(true);
    try {
      const [listaProductos, listaPedidos] = await Promise.all([
        listarProductos(),
        listarPedidos(),
      ]);
      setProductos(listaProductos);
      setPedidos(listaPedidos);
      setAlertasStock(construirAlertasDeProductos(listaProductos, motivoAlertas));
    } catch (err) {
      onError(
        err instanceof Error ? err.message : 'No fue posible conectar con el servidor backend.',
      );
    } finally {
      setCargando(false);
    }
  }, [onError]);

  useEffect(() => {
    void cargarDatos('Detectado al cargar el inventario');
  }, [cargarDatos]);

  const cerrarAlerta = useCallback((alertaId: string) => {
    setAlertasStock((prev) => prev.filter((item) => item.id !== alertaId));
  }, []);

  const cerrarTodasLasAlertas = useCallback(() => {
    setAlertasStock([]);
  }, []);

  return {
    productos,
    pedidos,
    cargando,
    alertasStock,
    cargarDatos,
    cerrarAlerta,
    cerrarTodasLasAlertas,
  };
}
