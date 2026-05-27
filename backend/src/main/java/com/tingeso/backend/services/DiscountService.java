package com.tingeso.backend.services;

import com.tingeso.backend.configuration.DiscountConfig;
import com.tingeso.backend.entities.Discount;
import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.entities.ReservationState;
import com.tingeso.backend.repositories.DiscountRepository;
import com.tingeso.backend.repositories.ReservationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final ReservationRepository reservationRepository;
    private final DiscountRepository discountRepository;
    private final DiscountConfig discountConfig;

    @Transactional(readOnly = true)
    public Discount findDiscount() {
        return discountRepository.findById(1L).orElse(null);
    }

    @Transactional
    public Discount update(Discount discount) {
        Discount discountSaved = discountRepository.findById(1L)
                .orElseThrow(() -> new EntityNotFoundException("Discount not found"));
        discountSaved.setCombinableDiscounts(discount.isCombinableDiscounts());
        discountSaved.setMaxDiscountLimit(discount.getMaxDiscountLimit());
        discountSaved.setMinPassengers(discount.getMinPassengers());
        discountSaved.setDiscountPassengers(discount.getDiscountPassengers());
        discountSaved.setMinReservations(discount.getMinReservations());
        discountSaved.setDiscountReservations(discount.getDiscountReservations());
        discountSaved.setDaysWindow(discount.getDaysWindow());
        discountSaved.setMinReservationsMultiplePackages(discount.getMinReservationsMultiplePackages());
        discountSaved.setDiscountMultiplePackages(discount.getDiscountMultiplePackages());
        return discountRepository.save(discountSaved);
    }

    // only if passengersAmount >= MIN_PASSENGERS
    // discount = DISCOUNT_PASSENGERS
    public BigDecimal calculatePassengersAmountDiscount(Integer passengersAmount) {
        return (passengersAmount != null && passengersAmount >= discountConfig.getMinPassengers())
                ? discountConfig.getDiscountPassengers()
                : BigDecimal.ZERO;
    }

    // only if reservationsAmount >= MIN_RESERVATIONS
    // discount = DISCOUNT_RESERVATIONS
    public BigDecimal calculateFrequentClientDiscount(String userEmail) {
        long validReservationsCount = reservationRepository.findByUserEmail(userEmail)
                .stream()
                .filter(this::isCompletedReservation)
                .count();
        return validReservationsCount >= discountConfig.getMinReservations() ? discountConfig.getDiscountReservations() : BigDecimal.ZERO;
    }

    // only if reservationsAmount >= MIN_RESERVATIONS_MULTIPLE_PACKAGES && today - DAYS_WINDOW is after payment date
    // discount = DISCOUNT_MULTIPLE_PACKAGES
    public BigDecimal calculateMultiplePackagesDiscount(String userEmail) {
        LocalDate limitDate = LocalDate.now().minusDays(discountConfig.getDaysWindow());
        long recentReservationsCount = reservationRepository.findByUserEmail(userEmail)
                .stream()
                .filter(this::isCompletedReservation)
                .filter(res -> res.getReservationDate().toLocalDate().isAfter(limitDate))
                .count();
        return recentReservationsCount >= discountConfig.getMinReservationsMultiplePackages() ? discountConfig.getDiscountMultiplePackages() : BigDecimal.ZERO;
    }

    public boolean isCompletedReservation(Reservation reservation) {
        return reservation.getReservationState() != ReservationState.PENDING &&
                reservation.getReservationState() != ReservationState.CANCELED;
    }
}