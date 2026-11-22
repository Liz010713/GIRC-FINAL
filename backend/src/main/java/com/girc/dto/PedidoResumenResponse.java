package com.girc.dto;

import com.girc.domain.enums.EstadoPedido;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PedidoResumenResponse(
        Long id,
        String codigoOrden,
        Long idUsuario,
        BigDecimal totalNeto,
        EstadoPedido estado,
        OffsetDateTime fechaCreacion
) {
}
