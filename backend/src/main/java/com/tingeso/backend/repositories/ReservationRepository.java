package com.tingeso.backend.repositories;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.entities.ReservationState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserEmail(String userEmail);
    List<Reservation> findByTourPackageId(Long id);
    List<Reservation> findByReservationState(ReservationState reservationState);
}
