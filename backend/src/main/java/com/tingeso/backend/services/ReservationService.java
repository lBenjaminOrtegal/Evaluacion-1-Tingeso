package com.tingeso.backend.services;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.entities.ReservationState;
import com.tingeso.backend.entities.TourPackage;
import com.tingeso.backend.entities.TourPackageState;
import com.tingeso.backend.repositories.ReservationRepository;
import com.tingeso.backend.repositories.TourPackageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final TourPackageRepository tourPackageRepository;

//    DISCOUNTS
//    private Integer passengersAmountDiscount;
//    private Integer passengersAmountForDiscount;
//    private Integer discountLimitPasAmoDis;
//    private Boolean cumulativeDiscountPasAmoDis;
//
//    private Integer frequentClientPurchasesAmountDiscount;
//    private Integer frequentClientPurchasesAmountForDiscount;
//    private Integer discountLimitFreCliPurAmoDis;
//    private Boolean cumulativeDiscountFreCliPurAmoDis;
//
//    private Integer multiplePackagesAmountDiscount;
//    private Integer multiplePackagesAmountForDiscount;
//    private Integer discountLimitMulPacAmoDis;
//    private Boolean cumulativeDiscountMulPacAmoDis;
//
//    private Integer promotionDiscount;
//    private Integer promotionAmountForDiscount;
//    private Boolean cumulativeDiscountProDis;

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
    public Reservation create(Reservation reservation) {
        TourPackage tourPackage = tourPackageRepository.findById(reservation.getTourPackageId())
                .orElseThrow(() -> new RuntimeException("Tour package not found with id: " + reservation.getTourPackageId()));
        if (tourPackage.getTourPackageState() != TourPackageState.AVAILABLE) {
            throw new IllegalStateException("Tour package not available for reservations");
        }
        tourPackage.setRemainingSpots(tourPackage.getRemainingSpots() - reservation.getPassengersAmount());
        if (tourPackage.getRemainingSpots() <= 0) {
            tourPackage.setTourPackageState(TourPackageState.SOLD_OUT);
        }
        reservation.setPrice(calculatePrice(reservation));
        reservation.setTourPackageName(tourPackage.getName());
        reservation.setReservationDate(LocalDateTime.now());
        tourPackageRepository.save(tourPackage);
        return reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation update(Reservation reservation) {
        Reservation reservationSaved = reservationRepository.findById(reservation.getId())
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found"));
        TourPackage tourPackage = tourPackageRepository.findById(reservationSaved.getTourPackageId())
                .orElseThrow(() -> new EntityNotFoundException("Tour package not found"));
        if (reservationSaved.getReservationState() == ReservationState.CANCELED) {
            throw new IllegalStateException("Cannot modify reservation because reservation is already canceled.");
        }
        if (reservation.getReservationState() == ReservationState.CONFIRMED) {
            if (reservationSaved.getPaymentDate() != null) {
                reservationSaved.setReservationState(ReservationState.CONFIRMED);
            } else {
                throw new IllegalStateException("Cannot modify reservation because payment date is null (not transaction done).");
            }
        }
        if (reservation.getReservationState() == ReservationState.CANCELED) {
            tourPackage.setRemainingSpots(tourPackage.getRemainingSpots() + reservationSaved.getPassengersAmount());
            tourPackage.setTourPackageState(TourPackageState.AVAILABLE);
        }
        else if (!Objects.equals(reservationSaved.getPassengersAmount(), reservation.getPassengersAmount())) {
            int difference = reservation.getPassengersAmount() - reservationSaved.getPassengersAmount();
            if (tourPackage.getRemainingSpots() < difference) {
                throw new IllegalStateException("Not enough spots for reservation.");
            }
            tourPackage.setRemainingSpots(tourPackage.getRemainingSpots() - difference);
            tourPackage.setTourPackageState(tourPackage.getRemainingSpots() <= 0
                    ? TourPackageState.SOLD_OUT
                    : TourPackageState.AVAILABLE);
        }
        tourPackageRepository.save(tourPackage);
        reservationSaved.setPreferences(reservation.getPreferences());
        reservationSaved.setSpecialRequests(reservation.getSpecialRequests());
        reservationSaved.setPassengersAmount(reservation.getPassengersAmount());
        reservationSaved.setReservationState(reservation.getReservationState());
        reservationSaved.setPrice(calculatePrice(reservationSaved));
        return reservationRepository.save(reservationSaved);
    }

    @Transactional
    public void deleteById(Long id) {
        Reservation reservationSaved = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + id));
        TourPackage tourPackage = tourPackageRepository.findById(reservationSaved.getTourPackageId())
                .orElseThrow(() -> new RuntimeException("Tour package not found with id: " + reservationSaved.getTourPackageId()));
        tourPackage.setRemainingSpots(tourPackage.getRemainingSpots() + reservationSaved.getPassengersAmount());
        tourPackage.setTourPackageState(TourPackageState.AVAILABLE);
        tourPackageRepository.save(tourPackage);
        reservationRepository.deleteById(id);
    }

    public BigDecimal calculatePrice(Reservation reservation) {
        TourPackage tourPackage = tourPackageRepository.findById(reservation.getTourPackageId())
                .orElseThrow(() -> new RuntimeException("Tour package not found with id: " + reservation.getTourPackageId()));
        return tourPackage.getPrice().multiply(BigDecimal.valueOf(reservation.getPassengersAmount()));
    }
}
