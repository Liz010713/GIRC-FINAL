package com.girc.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CrearProductoRequest(
        @NotBlank(message = "El campo sku es obligatorio")
        @Size(max = 50, message = "El campo sku no puede superar 50 caracteres")
        String sku,

        @NotBlank(message = "El campo nombreProducto es obligatorio")
        @Size(max = 150, message = "El campo nombreProducto no puede superar 150 caracteres")
        String nombreProducto,

        @NotNull(message = "El campo precioUnitario es obligatorio")
        @DecimalMin(value = "0.01", message = "El campo precioUnitario debe ser mayor a 0")
        BigDecimal precioUnitario,

        @NotNull(message = "El campo stockActual es obligatorio")
        @Min(value = 0, message = "El campo stockActual debe ser mayor o igual a 0")
        Integer stockActual,

        @NotNull(message = "El campo stockMinimo es obligatorio")
        @Min(value = 1, message = "El campo stockMinimo mínimo es 1")
        Integer stockMinimo
) {
}
