package com.girc.controller;

import com.girc.domain.entity.Producto;
import com.girc.domain.enums.EstadoProducto;
import com.girc.exception.ConflictoNegocioException;
import com.girc.exception.GlobalExceptionHandler;
import com.girc.service.ProductoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductoController.class)
@Import(GlobalExceptionHandler.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductoService productoService;

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
                .estado(EstadoProducto.DISPONIBLE)
                .build();
        when(productoService.listarProductos()).thenReturn(List.of(producto));

        // Act & Assert
        mockMvc.perform(get("/api/v1/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("GIRC-TEC-001"))
                .andExpect(jsonPath("$[0].nombreProducto").value("Auriculares inalámbricos"))
                .andExpect(jsonPath("$[0].stockActual").value(24))
                .andExpect(jsonPath("$[0].estado").value("Disponible"));
    }

    @Test
    void crearProducto_Valido_Retorna201CreatedConEstadoCalculado() throws Exception {
        // Arrange
        Producto creado = Producto.builder()
                .id(5L)
                .sku("TAL-001")
                .nombreProducto("Taladro Percutor")
                .precioUnitario(new BigDecimal("185000.00"))
                .stockActual(12)
                .stockMinimo(5)
                .estado(EstadoProducto.DISPONIBLE)
                .build();
        when(productoService.crearProducto(any())).thenReturn(creado);

        String requestJson = """
                {
                  "sku": "TAL-001",
                  "nombreProducto": "Taladro Percutor",
                  "precioUnitario": 185000.00,
                  "stockActual": 12,
                  "stockMinimo": 5
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.sku").value("TAL-001"))
                .andExpect(jsonPath("$.nombreProducto").value("Taladro Percutor"))
                .andExpect(jsonPath("$.precioUnitario").value(185000.00))
                .andExpect(jsonPath("$.stockActual").value(12))
                .andExpect(jsonPath("$.estado").value("Disponible"));
    }

    @Test
    void crearProducto_DatosInvalidos_Retorna400AntesDeInvocarServicio() throws Exception {
        // Arrange
        String requestJson = """
                {
                  "sku": " ",
                  "nombreProducto": "",
                  "precioUnitario": 0,
                  "stockActual": -1,
                  "stockMinimo": 0
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST_VALIDACION"))
                .andExpect(jsonPath("$.path").value("/api/v1/productos"));
        verify(productoService, never()).crearProducto(any());
    }

    @Test
    void crearProducto_SkuDuplicado_Retorna409ConErrorResponse() throws Exception {
        // Arrange
        when(productoService.crearProducto(any()))
                .thenThrow(new ConflictoNegocioException("Ya existe un producto registrado con el SKU: TAL-001"));

        String requestJson = """
                {
                  "sku": "TAL-001",
                  "nombreProducto": "Taladro Percutor",
                  "precioUnitario": 185000.00,
                  "stockActual": 12,
                  "stockMinimo": 5
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("CONFLICTO_NEGOCIO"))
                .andExpect(jsonPath("$.path").value("/api/v1/productos"));
    }
}
