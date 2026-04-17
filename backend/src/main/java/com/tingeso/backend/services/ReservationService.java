package com.tingeso.backend.services;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.entities.ReservationState;
import com.tingeso.backend.repositories.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public List<Reservation> findAll() {
        return reservationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Reservation findById(Long id) {
        return reservationRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<Reservation> findByUserEmail(String userEmail) {
        return reservationRepository.findByUserEmail(userEmail);
    }

    @Transactional(readOnly = true)
    public List<Reservation> findByTourPackageId(Long tourPackageId) {
        return reservationRepository.findByTourPackageId(tourPackageId);
    }

    @Transactional(readOnly = true)
    public List<Reservation> findByReservationState(ReservationState state) {
        return reservationRepository.findByReservationState(state);
    }

    @Transactional
    public Reservation save(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation update(Reservation reservation) throws EmptyResultDataAccessException {
        Reservation reservationSaved = reservationRepository.findById(reservation.getId())
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservation.getId()));
        reservationSaved.setReservationState(reservation.getReservationState());
        reservationSaved.setPreferences(reservation.getPreferences());
        reservationSaved.setSpecialRequests(reservation.getSpecialRequests());
        reservationSaved.setPassengersAmount(reservation.getPassengersAmount());
        return reservationRepository.save(reservationSaved);
    }

    @Transactional
    public void deleteById(Long id) {
        reservationRepository.deleteById(id);
    }
}
