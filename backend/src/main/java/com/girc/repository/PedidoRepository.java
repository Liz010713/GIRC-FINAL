package com.girc.repository;

import com.girc.domain.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    boolean existsByClaveIdempotencia(String claveIdempotencia);
}