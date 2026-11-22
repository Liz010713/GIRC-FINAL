package com.girc.controller;

import com.girc.domain.entity.Producto;
import com.girc.repository.ProductoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductoController.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductoRepository productoRepository;

    @Test
    void listarProductos_RetornaCatalogoConExistenciasYEstado() throws Exception {
        // Arrange
        Producto producto = Producto.builder()
                .id(1L)
                .sku("GIRC-TEC-001")
                .nombreProducto("Auriculares inalámbricos")
                .precioUnitario(new BigDecimal("89900.00"))
                .stockActual(24)
                .stockMinimo(5)
                .estado("Disponible")
                .build();
        when(productoRepository.findAll()).thenReturn(List.of(producto));

        // Act & Assert
        mockMvc.perform(get("/api/v1/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("GIRC-TEC-001"))
                .andExpect(jsonPath("$[0].nombreProducto").value("Auriculares inalámbricos"))
                .andExpect(jsonPath("$[0].stockActual").value(24))
                .andExpect(jsonPath("$[0].estado").value("Disponible"));
    }
}