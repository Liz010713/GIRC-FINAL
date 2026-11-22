package com.girc.service;

import com.girc.domain.entity.Pedido;
import com.girc.dto.CrearPedidoRequest;
import com.girc.dto.PedidoResumenResponse;

import java.util.List;

public interface PedidoService {

    List<PedidoResumenResponse> listarPedidos();

    Pedido crearPedido(CrearPedidoRequest request);
}