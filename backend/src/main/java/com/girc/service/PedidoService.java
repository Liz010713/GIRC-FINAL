package com.girc.service;

import com.girc.domain.entity.Pedido;
import com.girc.dto.CrearPedidoRequest;

public interface PedidoService {

    Pedido crearPedido(CrearPedidoRequest request);
}