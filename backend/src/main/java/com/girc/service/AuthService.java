package com.girc.service;

import com.girc.dto.LoginRequest;
import com.girc.dto.RegistroUsuarioRequest;
import com.girc.dto.UsuarioResponse;

public interface AuthService {

    UsuarioResponse registrar(RegistroUsuarioRequest request);

    UsuarioResponse login(LoginRequest request);
}
