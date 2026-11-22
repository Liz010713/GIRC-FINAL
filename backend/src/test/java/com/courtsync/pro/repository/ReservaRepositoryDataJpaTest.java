package com.courtsync.pro.repository;

import com.courtsync.pro.domain.entity.Cancha;
import com.courtsync.pro.domain.entity.EstadoReserva;
import com.courtsync.pro.domain.entity.Reserva;
import com.courtsync.pro.domain.entity.TipoCancha;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = {
        "spring.sql.init.mode=never",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class ReservaRepositoryDataJpaTest {

    private static final OffsetDateTime AHORA = OffsetDateTime.of(
            2026, 11, 21, 12, 0, 0, 0, ZoneOffset.UTC);
    private static final OffsetDateTime INICIO_EXISTENTE = OffsetDateTime.of(
            2026, 11, 25, 18, 0, 0, 0, ZoneOffset.UTC);

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ReservaRepository reservaRepository;

    private Cancha cancha;

    @BeforeEach
    void setUp() {
        cancha = entityManager.persistAndFlush(Cancha.builder()
                .nombre("Cancha de prueba")
                .tipoCancha(TipoCancha.PADEL)
                .tarifaHora(50000.0)
                .activa(true)
                .build());
    }

    @Test
    void findReservasActivasEnRangoPorCancha_DetectaSolapamientoParcial() {
        // Arrange
        entityManager.persistAndFlush(reserva(
                "RES-OVERLAP",
                INICIO_EXISTENTE,
                INICIO_EXISTENTE.plusHours(2),
                EstadoReserva.CONFIRMADA));

        // Act
        List<Reserva> resultado = reservaRepository.findReservasActivasEnRangoPorCancha(
                cancha.getId(),
                INICIO_EXISTENTE.plusHours(1),
                INICIO_EXISTENTE.plusHours(3),
                AHORA);

        // Assert
        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getCodigoConfirmacion()).isEqualTo("RES-OVERLAP");
    }

    @Test
    void findReservasActivasEnRangoPorCancha_PermiteHorariosContiguos() {
        // Arrange
        entityManager.persistAndFlush(reserva(
                "RES-CONTIGUA",
                INICIO_EXISTENTE,
                INICIO_EXISTENTE.plusHours(2),
                EstadoReserva.CONFIRMADA));

        // Act
        List<Reserva> resultado = reservaRepository.findReservasActivasEnRangoPorCancha(
                cancha.getId(),
                INICIO_EXISTENTE.plusHours(2),
                INICIO_EXISTENTE.plusHours(3),
                AHORA);

        // Assert
        assertThat(resultado).isEmpty();
    }

    @Test
    void findReservasActivasEnRangoPorCancha_IgnoraReservasCanceladas() {
        // Arrange
        entityManager.persistAndFlush(reserva(
                "RES-CANCELADA",
                INICIO_EXISTENTE,
                INICIO_EXISTENTE.plusHours(2),
                EstadoReserva.CANCELADA));

        // Act
        List<Reserva> resultado = reservaRepository.findReservasActivasEnRangoPorCancha(
                cancha.getId(),
                INICIO_EXISTENTE.plusHours(1),
                INICIO_EXISTENTE.plusHours(3),
                AHORA);

        // Assert
        assertThat(resultado).isEmpty();
    }

    private Reserva reserva(
            String codigo,
            OffsetDateTime inicio,
            OffsetDateTime fin,
            EstadoReserva estado
    ) {
        return Reserva.builder()
                .codigoConfirmacion(codigo)
                .cancha(cancha)
                .usuarioId(1L)
                .fechaHoraInicio(inicio)
                .fechaHoraFin(fin)
                .duracionHoras((int) (fin.toEpochSecond() - inicio.toEpochSecond()) / 3600)
                .valorTotal(100000.0)
                .valorAnticipo(50000.0)
                .estado(estado)
                .fechaCreacion(AHORA.minusDays(1))
                .fechaExpiracionPago(AHORA.plusMinutes(10))
                .build();
    }
}