package com.tingeso.backend.services;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.entities.ReservationState;
import com.tingeso.backend.repositories.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

import static com.tingeso.backend.configuration.DiscountConfig.*;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final ReservationRepository reservationRepository;

    // only if passengersAmount >= MIN_PASSENGERS
    // discount = DISCOUNT_PASSENGERS
    public BigDecimal calculatePassengersAmountDiscount(Integer passengersAmount) {
        return (passengersAmount != null && passengersAmount >= MIN_PASSENGERS)
                ? DISCOUNT_PASSENGERS
                : BigDecimal.ZERO;
    }

    // only if reservationsAmount >= MIN_RESERVATIONS
    // discount = DISCOUNT_RESERVATIONS
    public BigDecimal calculateFrequentClientDiscount(String userEmail) {
        long validReservationsCount = reservationRepository.findByUserEmail(userEmail)
                .stream()
                .filter(this::isCompletedReservation)
                .count();
        return validReservationsCount >= MIN_RESERVATIONS ? DISCOUNT_RESERVATIONS : BigDecimal.ZERO;
    }

    // only if reservationsAmount >= MIN_RESERVATIONS_MULTIPLE_PACKAGES && today - DAYS_WINDOW is after payment date
    // discount = DISCOUNT_MULTIPLE_PACKAGES
    public BigDecimal calculateMultiplePackagesDiscount(String userEmail) {
        LocalDate limitDate = LocalDate.now().minusDays(DAYS_WINDOW);
        long recentReservationsCount = reservationRepository.findByUserEmail(userEmail)
                .stream()
                .filter(this::isCompletedReservation)
                .filter(res -> res.getReservationDate().toLocalDate().isAfter(limitDate))
                .count();
        return recentReservationsCount >= MIN_RESERVATIONS_MULTIPLE_PACKAGES ? DISCOUNT_MULTIPLE_PACKAGES : BigDecimal.ZERO;
    }

    private boolean isCompletedReservation(Reservation reservation) {
        return reservation.getReservationState() != ReservationState.PENDING &&
                reservation.getReservationState() != ReservationState.CANCELED;
    }
}