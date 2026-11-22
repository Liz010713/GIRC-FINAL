package com.girc.service;

import com.girc.domain.entity.Producto;
import com.girc.domain.enums.EstadoProducto;
import com.girc.dto.CrearProductoRequest;
import com.girc.exception.ConflictoNegocioException;
import com.girc.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    @Override
    @Transactional
    public Producto crearProducto(CrearProductoRequest request) {
        String skuNormalizado = request.sku().trim();
        if (productoRepository.existsBySku(skuNormalizado)) {
            throw new ConflictoNegocioException("Ya existe un producto registrado con el SKU: " + skuNormalizado);
        }

        EstadoProducto estado = EstadoProducto.desdeStock(request.stockActual(), request.stockMinimo());

        Producto producto = Producto.builder()
                .sku(skuNormalizado)
                .nombreProducto(request.nombreProducto().trim())
                .precioUnitario(request.precioUnitario())
                .stockActual(request.stockActual())
                .stockMinimo(request.stockMinimo())
                .estado(estado)
                .build();

        return productoRepository.save(producto);
    }
}
