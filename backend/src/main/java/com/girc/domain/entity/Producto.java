package com.girc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @NotBlank
    @Column(name = "nombre_producto", nullable = false, length = 150)
    private String nombreProducto;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private java.math.BigDecimal precioUnitario;

    @NotNull
    @Min(0)
    @Column(name = "stock_actual", nullable = false)
    private Integer stockActual;

    @NotNull
    @Min(1)
    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo;

    @NotBlank
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String estado = "Disponible";
}