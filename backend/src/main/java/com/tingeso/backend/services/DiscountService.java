package com.tingeso.backend.services;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.entities.ReservationState;
import com.tingeso.backend.repositories.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final ReservationRepository reservationRepository;

    // only if passengersAmount >= 4
    // discount = 5%
    public BigDecimal calculatePassengersAmountDiscount(Integer passengersAmount) {
        final int MIN_PASSENGERS = 4;
        final BigDecimal DISCOUNT_PCT = new BigDecimal("0.05"); // 5%
        return (passengersAmount != null && passengersAmount >= MIN_PASSENGERS)
                ? DISCOUNT_PCT
                : BigDecimal.ZERO;
    }

    // only if reservationsAmount >= 3
    // discount = 10%
    public BigDecimal calculateFrequentClientDiscount(String userEmail) {
        final int MIN_RESERVATIONS = 3;
        final BigDecimal DISCOUNT_PCT = new BigDecimal("0.10"); // 10%
        long validReservationsCount = reservationRepository.findByUserEmail(userEmail)
                .stream()
                .filter(this::isCompletedReservation)
                .count();
        return validReservationsCount >= MIN_RESERVATIONS ? DISCOUNT_PCT : BigDecimal.ZERO;
    }

    // only if reservationsAmount >= 3 && today - days is after payment date
    // discount = 10%
    public BigDecimal calculateMultiplePackagesDiscount(String userEmail) {
        final int DAYS_WINDOW = 7;
        final int MIN_RESERVATIONS = 3;
        final BigDecimal DISCOUNT_PCT = new BigDecimal("0.15"); // 15%
        LocalDate limitDate = LocalDate.now().minusDays(DAYS_WINDOW);
        long recentReservationsCount = reservationRepository.findByUserEmail(userEmail)
                .stream()
                .filter(this::isCompletedReservation)
                .filter(res -> res.getReservationDate().toLocalDate().isAfter(limitDate))
                .count();
        return recentReservationsCount >= MIN_RESERVATIONS ? DISCOUNT_PCT : BigDecimal.ZERO;
    }

    private boolean isCompletedReservation(Reservation reservation) {
        return reservation.getReservationState() != ReservationState.PENDING &&
                reservation.getReservationState() != ReservationState.CANCELED;
    }
}