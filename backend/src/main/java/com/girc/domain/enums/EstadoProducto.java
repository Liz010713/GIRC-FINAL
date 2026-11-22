package com.girc.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EstadoProducto {
    DISPONIBLE("Disponible"),
    CRITICO("Crítico"),
    AGOTADO("Agotado");

    private final String etiqueta;

    EstadoProducto(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    @JsonValue
    public String getEtiqueta() {
        return etiqueta;
    }

    public static EstadoProducto desdeStock(int stockActual, int stockMinimo) {
        if (stockActual == 0) {
            return AGOTADO;
        }
        if (stockActual <= stockMinimo) {
            return CRITICO;
        }
        return DISPONIBLE;
    }

    @JsonCreator
    public static EstadoProducto fromValue(String value) {
        if (value == null) {
            return null;
        }
        for (EstadoProducto estado : values()) {
            if (estado.name().equalsIgnoreCase(value) || estado.etiqueta.equalsIgnoreCase(value)) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado de producto no válido: " + value);
    }
}
