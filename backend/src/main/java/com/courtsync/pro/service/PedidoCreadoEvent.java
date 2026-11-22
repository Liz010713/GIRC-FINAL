package com.courtsync.pro.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PedidoCreadoEvent(
        Long pedidoId,
        String codigoOrden,
        Long idUsuario,
        BigDecimal totalNeto,
        OffsetDateTime fechaCreacion
) {
}