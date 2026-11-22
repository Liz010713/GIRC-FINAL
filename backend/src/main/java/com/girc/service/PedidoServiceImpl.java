package com.girc.service;

import com.girc.domain.entity.DetallePedido;
import com.girc.domain.entity.Pedido;
import com.girc.domain.entity.Producto;
import com.girc.dto.CrearPedidoRequest;
import com.girc.exception.ConflictoNegocioException;
import com.girc.exception.RecursoNoEncontradoException;
import com.girc.exception.StockInsuficienteException;
import com.girc.repository.PedidoRepository;
import com.girc.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PedidoServiceImpl implements PedidoService {

    private static final String ESTADO_PENDIENTE = "Pendiente";
    private static final String ESTADO_DISPONIBLE = "Disponible";
    private static final String ESTADO_CRITICO = "Crítico";
    private static final String ESTADO_AGOTADO = "Agotado";

    private final ProductoRepository productoRepository;
    private final PedidoRepository pedidoRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public Pedido crearPedido(CrearPedidoRequest request) {
        if (pedidoRepository.existsByClaveIdempotencia(request.claveIdempotencia())) {
            throw new ConflictoNegocioException(
                    "Ya existe un pedido con la clave de idempotencia indicada.");
        }

        Map<Long, Producto> productosPorId = new HashMap<>();
        Map<Long, Integer> stockRestantePorProducto = new HashMap<>();
        List<DetallePedido> detalles = new ArrayList<>();
        BigDecimal totalNeto = BigDecimal.ZERO;

        for (CrearPedidoRequest.Item item : request.items()) {
            Long idProducto = item.idProducto();
            Producto producto = productosPorId.get(idProducto);
            if (producto == null) {
                producto = productoRepository.findByIdWithLock(idProducto)
                        .orElseThrow(() -> new RecursoNoEncontradoException(
                                "No se encontró el producto con id: " + idProducto));
                productosPorId.put(idProducto, producto);
            }

            int stockRestante = stockRestantePorProducto.getOrDefault(idProducto, producto.getStockActual());
            if (item.cantidadSolicitada() > stockRestante) {
                throw new StockInsuficienteException(
                        "Stock insuficiente para el producto " + producto.getNombreProducto()
                                + ". Disponible: " + stockRestante
                                + ", solicitado: " + item.cantidadSolicitada());
            }

            int nuevoStock = stockRestante - item.cantidadSolicitada();
            stockRestantePorProducto.put(idProducto, nuevoStock);

            BigDecimal subtotal = producto.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(item.cantidadSolicitada()));
            totalNeto = totalNeto.add(subtotal);
            detalles.add(DetallePedido.builder()
                    .producto(producto)
                    .cantidadSolicitada(item.cantidadSolicitada())
                    .precioUnitario(producto.getPrecioUnitario())
                    .subtotal(subtotal)
                    .build());
        }

        stockRestantePorProducto.forEach((idProducto, stockRestante) -> {
            Producto producto = productosPorId.get(idProducto);
            producto.setStockActual(stockRestante);
            producto.setEstado(calcularEstadoProducto(producto));
        });

        OffsetDateTime ahora = OffsetDateTime.now(ZoneOffset.UTC);
        Pedido pedido = Pedido.builder()
                .codigoOrden("ORD-" + UUID.randomUUID().toString().toUpperCase())
                .idUsuario(request.idUsuario())
                .claveIdempotencia(request.claveIdempotencia())
                .totalNeto(totalNeto)
                .estado(ESTADO_PENDIENTE)
                .fechaCreacion(ahora)
                .detalles(detalles)
                .build();
        detalles.forEach(detalle -> detalle.setPedido(pedido));

        Pedido pedidoGuardado = pedidoRepository.save(pedido);
        eventPublisher.publishEvent(new PedidoCreadoEvent(
                pedidoGuardado.getId(),
                pedidoGuardado.getCodigoOrden(),
                pedidoGuardado.getIdUsuario(),
                pedidoGuardado.getTotalNeto(),
                pedidoGuardado.getFechaCreacion()));

        return pedidoGuardado;
    }

    private String calcularEstadoProducto(Producto producto) {
        if (producto.getStockActual() == 0) {
            return ESTADO_AGOTADO;
        }
        if (producto.getStockActual() <= producto.getStockMinimo()) {
            return ESTADO_CRITICO;
        }
        return ESTADO_DISPONIBLE;
    }
}