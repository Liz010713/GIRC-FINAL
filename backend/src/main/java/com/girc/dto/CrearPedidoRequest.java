package com.girc.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CrearPedidoRequest(
        @NotNull(message = "El campo idUsuario es obligatorio")
        Long idUsuario,

        @NotBlank(message = "El campo claveIdempotencia es obligatorio")
        String claveIdempotencia,

        @NotEmpty(message = "El pedido debe contener al menos un ítem")
        @Valid
        List<Item> items
) {

    public record Item(
            @NotNull(message = "El campo idProducto es obligatorio")
            Long idProducto,

            @NotNull(message = "El campo cantidadSolicitada es obligatorio")
            @Min(value = 1, message = "La cantidad solicitada mínima es 1")
            Integer cantidadSolicitada
    ) {
    }
}