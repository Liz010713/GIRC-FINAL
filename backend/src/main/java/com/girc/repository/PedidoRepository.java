package com.girc.repository;

import com.girc.domain.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    boolean existsByClaveIdempotencia(String claveIdempotencia);

    List<Pedido> findAllByOrderByFechaCreacionDesc();
}