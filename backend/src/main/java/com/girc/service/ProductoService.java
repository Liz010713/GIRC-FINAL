package com.girc.service;

import com.girc.domain.entity.Producto;
import com.girc.dto.CrearProductoRequest;

import java.util.List;

public interface ProductoService {

    List<Producto> listarProductos();

    Producto crearProducto(CrearProductoRequest request);
}
