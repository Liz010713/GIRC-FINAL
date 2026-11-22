package com.courtsync.pro.repository;

import com.courtsync.pro.domain.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    boolean existsByClaveIdempotencia(String claveIdempotencia);
}