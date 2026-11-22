package com.girc.service;

import com.girc.domain.entity.Usuario;
import com.girc.domain.enums.RolUsuario;
import com.girc.dto.LoginRequest;
import com.girc.dto.RegistroUsuarioRequest;
import com.girc.dto.UsuarioResponse;
import com.girc.exception.ConflictoNegocioException;
import com.girc.exception.CredencialesInvalidasException;
import com.girc.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(usuarioRepository, passwordEncoder);
    }

    @Test
    void registrar_CaminoFeliz_EncriptaPasswordYGuardaUsuario() {
        // Arrange
        RegistroUsuarioRequest request = new RegistroUsuarioRequest(
                "Carlos Operador",
                "Carlos@GIRC.com",
                "ClaveSegura1*",
                RolUsuario.USUARIO
        );
        when(usuarioRepository.existsByEmailIgnoreCase("carlos@girc.com")).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        // Act
        UsuarioResponse response = authService.registrar(request);

        // Assert
        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.email()).isEqualTo("carlos@girc.com");
        assertThat(response.rol()).isEqualTo(RolUsuario.USUARIO);
        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    void registrar_CorreoDuplicado_LanzaConflicto() {
        // Arrange
        RegistroUsuarioRequest request = new RegistroUsuarioRequest(
                "Admin",
                "admin@girc.com",
                "Admin123*",
                RolUsuario.ADMINISTRADOR
        );
        when(usuarioRepository.existsByEmailIgnoreCase("admin@girc.com")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.registrar(request))
                .isInstanceOf(ConflictoNegocioException.class)
                .hasMessageContaining("admin@girc.com");
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void login_CredencialesValidas_RetornaUsuario() {
        // Arrange
        Usuario existente = Usuario.builder()
                .id(1L)
                .nombreCompleto("Administrador GIRC")
                .email("admin@girc.com")
                .password(passwordEncoder.encode("Admin123*"))
                .rol(RolUsuario.ADMINISTRADOR)
                .fechaCreacion(OffsetDateTime.now(ZoneOffset.UTC))
                .build();
        when(usuarioRepository.findByEmailIgnoreCase("admin@girc.com")).thenReturn(Optional.of(existente));

        // Act
        UsuarioResponse response = authService.login(new LoginRequest("ADMIN@girc.com", "Admin123*"));

        // Assert
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.rol()).isEqualTo(RolUsuario.ADMINISTRADOR);
    }

    @Test
    void login_PasswordIncorrecta_Lanza401() {
        // Arrange
        Usuario existente = Usuario.builder()
                .id(1L)
                .nombreCompleto("Administrador GIRC")
                .email("admin@girc.com")
                .password(passwordEncoder.encode("Admin123*"))
                .rol(RolUsuario.ADMINISTRADOR)
                .fechaCreacion(OffsetDateTime.now(ZoneOffset.UTC))
                .build();
        when(usuarioRepository.findByEmailIgnoreCase("admin@girc.com")).thenReturn(Optional.of(existente));

        // Act & Assert
        assertThatThrownBy(() -> authService.login(new LoginRequest("admin@girc.com", "otra-clave")))
                .isInstanceOf(CredencialesInvalidasException.class);
    }
}
