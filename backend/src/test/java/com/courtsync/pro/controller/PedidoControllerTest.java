package com.courtsync.pro.controller;

import com.courtsync.pro.domain.entity.Pedido;
import com.courtsync.pro.exception.ConflictoNegocioException;
import com.courtsync.pro.exception.GlobalExceptionHandler;
import com.courtsync.pro.exception.StockInsuficienteException;
import com.courtsync.pro.service.PedidoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PedidoController.class)
@Import(GlobalExceptionHandler.class)
class PedidoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PedidoService pedidoService;

    @Test
    void crearPedido_JsonInvalido_Retorna400AntesDeInvocarServicio() throws Exception {
        // Arrange
        String requestJson = """
                {
                  "idUsuario": 7,
                  "claveIdempotencia": "clave-001",
                  "items": [
                    {"idProducto": 1, "cantidadSolicitada": 0}
                  ]
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST_VALIDACION"))
                .andExpect(jsonPath("$.path").value("/api/v1/pedidos"));
        verify(pedidoService, never()).crearPedido(any());
    }

    @Test
    void crearPedido_CamposObligatoriosNulos_Retorna400AntesDeInvocarServicio() throws Exception {
        // Arrange
        String requestJson = """
                {
                  "idUsuario": null,
                  "claveIdempotencia": " ",
                  "items": [
                    {"idProducto": null, "cantidadSolicitada": null}
                  ]
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST_VALIDACION"));
        verify(pedidoService, never()).crearPedido(any());
    }

    @Test
    void crearPedido_SinItems_Retorna400AntesDeInvocarServicio() throws Exception {
        // Arrange
        String requestJson = """
                {
                  "idUsuario": 7,
                  "claveIdempotencia": "clave-001",
                  "items": []
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
        verify(pedidoService, never()).crearPedido(any());
    }

    @Test
    void crearPedido_StockInsuficiente_Retorna422ConErrorResponse() throws Exception {
        // Arrange
        when(pedidoService.crearPedido(any()))
                .thenThrow(new StockInsuficienteException("Stock insuficiente para el producto Cuaderno."));
        String requestJson = requestValido();

        // Act & Assert
        mockMvc.perform(post("/api/v1/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.error").value("STOCK_INSUFICIENTE"))
                .andExpect(jsonPath("$.message").value("Stock insuficiente para el producto Cuaderno."))
                .andExpect(jsonPath("$.path").value("/api/v1/pedidos"))
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    @Test
    void crearPedido_ClaveIdempotenciaDuplicada_Retorna409ConErrorResponse() throws Exception {
        // Arrange
        when(pedidoService.crearPedido(any()))
                .thenThrow(new ConflictoNegocioException("La clave de idempotencia ya fue utilizada."));

        // Act & Assert
        mockMvc.perform(post("/api/v1/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestValido()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("CONFLICTO_NEGOCIO"))
                .andExpect(jsonPath("$.message").value("La clave de idempotencia ya fue utilizada."))
                .andExpect(jsonPath("$.path").value("/api/v1/pedidos"))
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    @Test
    void crearPedido_Valido_Retorna201Created() throws Exception {
        // Arrange
        Pedido pedido = Pedido.builder()
                .id(41L)
                .codigoOrden("ORD-TEST")
                .idUsuario(7L)
                .claveIdempotencia("clave-001")
                .totalNeto(java.math.BigDecimal.ZERO)
                .estado("Pendiente")
                .build();
        when(pedidoService.crearPedido(any())).thenReturn(pedido);

        // Act & Assert
        mockMvc.perform(post("/api/v1/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestValido()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(41))
                .andExpect(jsonPath("$.estado").value("Pendiente"));
    }

    private String requestValido() {
        return """
                {
                  "idUsuario": 7,
                  "claveIdempotencia": "clave-001",
                  "items": [
                    {"idProducto": 1, "cantidadSolicitada": 2}
                  ]
                }
                """;
    }
}