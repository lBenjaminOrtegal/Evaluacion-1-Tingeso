package com.tingeso.backend.repositories;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.enums.ReservationState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserEmail(String userEmail);

    List<Reservation> findByTourPackageId(Long id);

    List<Reservation> findByReservationState(ReservationState reservationState);

    @Query("SELECT r FROM Reservation r WHERE r.reservationState <> :excludedState AND (" +
            "r.paymentDate BETWEEN :start AND :end OR " +
            "r.reservationDate BETWEEN :start AND :end)")
    List<Reservation> findDateReports(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("excludedState") ReservationState excludedState
    );

    List<Reservation> findByReservationStateAndReservationDateBefore(ReservationState reservationState, LocalDateTime limit);
}