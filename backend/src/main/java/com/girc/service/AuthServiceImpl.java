package com.girc.service;

import com.girc.domain.entity.Usuario;
import com.girc.dto.LoginRequest;
import com.girc.dto.RegistroUsuarioRequest;
import com.girc.dto.UsuarioResponse;
import com.girc.exception.ConflictoNegocioException;
import com.girc.exception.CredencialesInvalidasException;
import com.girc.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UsuarioResponse registrar(RegistroUsuarioRequest request) {
        String emailNormalizado = request.email().trim().toLowerCase(Locale.ROOT);
        if (usuarioRepository.existsByEmailIgnoreCase(emailNormalizado)) {
            throw new ConflictoNegocioException("Ya existe un usuario registrado con el correo: " + emailNormalizado);
        }

        Usuario nuevo = Usuario.builder()
                .nombreCompleto(request.nombreCompleto().trim())
                .email(emailNormalizado)
                .password(passwordEncoder.encode(request.password()))
                .rol(request.rol())
                .fechaCreacion(OffsetDateTime.now(ZoneOffset.UTC))
                .build();

        Usuario guardado = usuarioRepository.save(nuevo);
        return toResponse(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse login(LoginRequest request) {
        String emailNormalizado = request.email().trim().toLowerCase(Locale.ROOT);
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(emailNormalizado)
                .orElseThrow(() -> new CredencialesInvalidasException("Correo o contraseña incorrectos."));

        if (!passwordEncoder.matches(request.password(), usuario.getPassword())) {
            throw new CredencialesInvalidasException("Correo o contraseña incorrectos.");
        }

        return toResponse(usuario);
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombreCompleto(),
                usuario.getEmail(),
                usuario.getRol(),
                usuario.getFechaCreacion()
        );
    }
}
