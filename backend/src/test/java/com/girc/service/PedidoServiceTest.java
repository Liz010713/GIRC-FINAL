package com.girc.service;

import com.girc.domain.entity.Pedido;
import com.girc.domain.entity.Producto;
import com.girc.dto.CrearPedidoRequest;
import com.girc.exception.ConflictoNegocioException;
import com.girc.exception.RecursoNoEncontradoException;
import com.girc.exception.StockInsuficienteException;
import com.girc.repository.PedidoRepository;
import com.girc.repository.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private PedidoServiceImpl pedidoService;

    @Test
    void crearPedido_CaminoFeliz_CalculaTotalYDescuentaStock() {
        // Arrange
        Producto producto = productoConStock(10, 6);
        CrearPedidoRequest request = request(4);
        when(pedidoRepository.existsByClaveIdempotencia("clave-001")).thenReturn(false);
        when(productoRepository.findByIdWithLock(1L)).thenReturn(Optional.of(producto));
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> {
            Pedido pedido = invocation.getArgument(0);
            pedido.setId(41L);
            return pedido;
        });

        // Act
        Pedido pedido = pedidoService.crearPedido(request);

        // Assert
        assertThat(pedido.getId()).isEqualTo(41L);
        assertThat(pedido.getEstado()).isEqualTo("Pendiente");
        assertThat(pedido.getTotalNeto()).isEqualByComparingTo("50.00");
        assertThat(pedido.getDetalles()).hasSize(1);
        assertThat(producto.getStockActual()).isEqualTo(6);
        assertThat(producto.getEstado()).isEqualTo("Crítico");
        verify(pedidoRepository, times(1)).save(any(Pedido.class));
        verify(eventPublisher, times(1)).publishEvent(any(PedidoCreadoEvent.class));
    }

    @Test
    void crearPedido_StockInsuficiente_LanzaExcepcionYNoGuardaNiNotifica() {
        // Arrange
        Producto producto = productoConStock(2, 1);
        CrearPedidoRequest request = request(3);
        when(pedidoRepository.existsByClaveIdempotencia("clave-001")).thenReturn(false);
        when(productoRepository.findByIdWithLock(1L)).thenReturn(Optional.of(producto));

        // Act & Assert
        assertThatThrownBy(() -> pedidoService.crearPedido(request))
                .isInstanceOf(StockInsuficienteException.class)
                .hasMessageContaining("Stock insuficiente");
        assertThat(producto.getStockActual()).isEqualTo(2);
        verify(pedidoRepository, never()).save(any(Pedido.class));
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void crearPedido_ProductoInexistente_Lanza404() {
        // Arrange
        CrearPedidoRequest request = request(1);
        when(pedidoRepository.existsByClaveIdempotencia("clave-001")).thenReturn(false);
        when(productoRepository.findByIdWithLock(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> pedidoService.crearPedido(request))
                .isInstanceOf(RecursoNoEncontradoException.class)
                .hasMessageContaining("producto con id: 1");
        verify(pedidoRepository, never()).save(any(Pedido.class));
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void crearPedido_ClaveIdempotenciaDuplicada_Lanza409SinConsultarProductos() {
        // Arrange
        CrearPedidoRequest request = request(1);
        when(pedidoRepository.existsByClaveIdempotencia("clave-001")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> pedidoService.crearPedido(request))
                .isInstanceOf(ConflictoNegocioException.class)
                .hasMessageContaining("clave de idempotencia");
        verify(productoRepository, never()).findByIdWithLock(any());
        verify(pedidoRepository, never()).save(any(Pedido.class));
        verify(eventPublisher, never()).publishEvent(any());
    }

    private Producto productoConStock(int stock, int stockMinimo) {
        return Producto.builder()
                .id(1L)
                .sku("SKU-001")
                .nombreProducto("Cuaderno")
                .precioUnitario(new BigDecimal("12.50"))
                .stockActual(stock)
                .stockMinimo(stockMinimo)
                .estado("Disponible")
                .build();
    }

    private CrearPedidoRequest request(int cantidad) {
        return new CrearPedidoRequest(
                7L,
                "clave-001",
                java.util.List.of(new CrearPedidoRequest.Item(1L, cantidad)));
    }
}