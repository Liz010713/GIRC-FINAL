package com.girc.controller;

import com.girc.domain.enums.RolUsuario;
import com.girc.dto.UsuarioResponse;
import com.girc.exception.ConflictoNegocioException;
import com.girc.exception.CredencialesInvalidasException;
import com.girc.exception.GlobalExceptionHandler;
import com.girc.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @Test
    void registrar_Valido_Retorna201Created() throws Exception {
        // Arrange
        UsuarioResponse respuesta = new UsuarioResponse(
                2L,
                "Laura Operadora",
                "laura@girc.com",
                RolUsuario.USUARIO,
                OffsetDateTime.now(ZoneOffset.UTC)
        );
        when(authService.registrar(any())).thenReturn(respuesta);

        String requestJson = """
                {
                  "nombreCompleto": "Laura Operadora",
                  "email": "laura@girc.com",
                  "password": "Usuario123*",
                  "rol": "USUARIO"
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.email").value("laura@girc.com"))
                .andExpect(jsonPath("$.rol").value("USUARIO"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void registrar_EmailDuplicado_Retorna409Conflict() throws Exception {
        // Arrange
        when(authService.registrar(any()))
                .thenThrow(new ConflictoNegocioException("Ya existe un usuario registrado con el correo: admin@girc.com"));

        String requestJson = """
                {
                  "nombreCompleto": "Admin Duplicado",
                  "email": "admin@girc.com",
                  "password": "Admin123*",
                  "rol": "ADMINISTRADOR"
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("CONFLICTO_NEGOCIO"));
    }

    @Test
    void registrar_DatosInvalidos_Retorna400SinInvocarServicio() throws Exception {
        // Arrange
        String requestJson = """
                {
                  "nombreCompleto": "",
                  "email": "correo-invalido",
                  "password": "123",
                  "rol": null
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("BAD_REQUEST_VALIDACION"));
        verify(authService, never()).registrar(any());
    }

    @Test
    void login_Valido_Retorna200ConUsuarioYRol() throws Exception {
        // Arrange
        UsuarioResponse respuesta = new UsuarioResponse(
                1L,
                "Administrador GIRC",
                "admin@girc.com",
                RolUsuario.ADMINISTRADOR,
                OffsetDateTime.now(ZoneOffset.UTC)
        );
        when(authService.login(any())).thenReturn(respuesta);

        String requestJson = """
                {
                  "email": "admin@girc.com",
                  "password": "Admin123*"
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("admin@girc.com"))
                .andExpect(jsonPath("$.rol").value("ADMINISTRADOR"));
    }

    @Test
    void login_CredencialesIncorrectas_Retorna401Unauthorized() throws Exception {
        // Arrange
        when(authService.login(any()))
                .thenThrow(new CredencialesInvalidasException("Correo o contraseña incorrectos."));

        String requestJson = """
                {
                  "email": "admin@girc.com",
                  "password": "Incorrecta"
                }
                """;

        // Act & Assert
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("CREDENCIALES_INVALIDAS"));
    }
}
