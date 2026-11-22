package com.girc.dto;

import com.girc.domain.enums.RolUsuario;

import java.time.OffsetDateTime;

public record UsuarioResponse(
        Long id,
        String nombreCompleto,
        String email,
        RolUsuario rol,
        OffsetDateTime fechaCreacion
) {
}
