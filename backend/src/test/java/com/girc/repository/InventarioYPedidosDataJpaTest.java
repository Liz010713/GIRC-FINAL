package com.girc.repository;

import com.girc.domain.entity.DetallePedido;
import com.girc.domain.entity.Pedido;
import com.girc.domain.entity.Producto;
import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest(properties = {
        "spring.sql.init.mode=never",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class InventarioYPedidosDataJpaTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProductoRepository productos;

    @Autowired
    private PedidoRepository pedidos;

    @Test
    void buscarProductoPorId_AplicaBloqueoPesimista() {
        // Arrange
        Long id = guardarProducto().getId();
        entityManager.clear();

        // Act
        Producto producto = productos.findByIdWithLock(id).orElseThrow();

        // Assert
        assertThat(producto.getStockActual()).isEqualTo(10);
        assertThat(entityManager.getEntityManager().getLockMode(producto))
                .isEqualTo(LockModeType.PESSIMISTIC_WRITE);
    }

    @Test
    void guardarPedido_PersisteDetalleYPermiteConsultarLaClave() {
        // Arrange
        Producto producto = guardarProducto();
        Pedido pedido = pedido("ORD-001", "clave-001");
        pedido.getDetalles().add(DetallePedido.builder()
                .pedido(pedido)
                .producto(producto)
                .cantidadSolicitada(2)
                .precioUnitario(producto.getPrecioUnitario())
                .subtotal(pedido.getTotalNeto())
                .build());

        // Act
        Long pedidoId = pedidos.saveAndFlush(pedido).getId();
        entityManager.clear();
        Pedido guardado = pedidos.findById(pedidoId).orElseThrow();

        // Assert
        assertThat(pedidos.existsByClaveIdempotencia("clave-001")).isTrue();
        assertThat(pedidos.existsByClaveIdempotencia("otra-clave")).isFalse();
        assertThat(guardado.getDetalles()).singleElement().satisfies(detalle -> {
            assertThat(detalle.getProducto().getId()).isEqualTo(producto.getId());
            assertThat(detalle.getCantidadSolicitada()).isEqualTo(2);
            assertThat(detalle.getSubtotal()).isEqualByComparingTo("25.00");
        });
    }

    @Test
    void guardarPedido_ClaveRepetida_ViolaRestriccionUnique() {
        // Arrange
        pedidos.saveAndFlush(pedido("ORD-001", "clave-001"));
        Pedido duplicado = pedido("ORD-002", "clave-001");

        // Act & Assert
        assertThatThrownBy(() -> pedidos.saveAndFlush(duplicado))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private Producto guardarProducto() {
        return entityManager.persistAndFlush(Producto.builder()
                .sku("CUA-001")
                .nombreProducto("Cuaderno")
                .stockActual(10)
                .stockMinimo(3)
                .precioUnitario(new BigDecimal("12.50"))
                .build());
    }

    private Pedido pedido(String codigoOrden, String clave) {
        return Pedido.builder()
                .codigoOrden(codigoOrden)
                .claveIdempotencia(clave)
                .idUsuario(1L)
                .totalNeto(new BigDecimal("25.00"))
                .build();
    }
}
