package com.courtsync.pro.service;

import com.courtsync.pro.domain.entity.Pedido;
import com.courtsync.pro.dto.CrearPedidoRequest;

public interface PedidoService {

    Pedido crearPedido(CrearPedidoRequest request);
}