package com.courtsync.pro.controller;

import com.courtsync.pro.domain.entity.Pedido;
import com.courtsync.pro.dto.CrearPedidoRequest;
import com.courtsync.pro.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<Pedido> crearPedido(@Valid @RequestBody CrearPedidoRequest request) {
        Pedido pedidoCreado = pedidoService.crearPedido(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoCreado);
    }
}