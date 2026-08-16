package com.tingeso.backend.services;

import com.tingeso.backend.configuration.DiscountConfig;
import com.tingeso.backend.dto.DiscountDTO;
import com.tingeso.backend.entities.Discount;
import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.enums.ReservationState;
import com.tingeso.backend.exceptions.ResourceNotFoundException;
import com.tingeso.backend.repositories.DiscountRepository;
import com.tingeso.backend.repositories.ReservationRepository;
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
        return discountRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found"));
    }

    @Transactional
    public DiscountDTO update(DiscountDTO dto) {
        Discount discountSaved = discountRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found when updating"));
        discountSaved.setCombinableDiscounts(dto.combinableDiscounts());
        discountSaved.setMaxDiscountLimit(dto.maxDiscountLimit());
        discountSaved.setMinPassengers(dto.minPassengers());
        discountSaved.setDiscountPassengers(dto.discountPassengers());
        discountSaved.setMinReservations(dto.minReservations());
        discountSaved.setDiscountReservations(dto.discountReservations());
        discountSaved.setDaysWindow(dto.daysWindow());
        discountSaved.setMinReservationsMultiplePackages(dto.minReservationsMultiplePackages());
        discountSaved.setDiscountMultiplePackages(dto.discountMultiplePackages());
        return discountToDTO(discountRepository.save(discountSaved));
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

    public DiscountDTO discountToDTO(Discount discount) {
        return new DiscountDTO(
                discount.isCombinableDiscounts(),
                discount.getMaxDiscountLimit(),
                discount.getMinPassengers(),
                discount.getDiscountPassengers(),
                discount.getMinReservations(),
                discount.getDiscountReservations(),
                discount.getDaysWindow(),
                discount.getMinReservationsMultiplePackages(),
                discount.getDiscountMultiplePackages()
        );
    }
}