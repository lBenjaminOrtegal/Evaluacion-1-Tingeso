package com.tingeso.backend.services;

import com.tingeso.backend.dto.DiscountDataDTO;
import com.tingeso.backend.entities.*;
import com.tingeso.backend.repositories.PromotionRepository;
import com.tingeso.backend.repositories.ReservationRepository;
import com.tingeso.backend.repositories.TourPackageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.tingeso.backend.configuration.DiscountConfig.COMBINABLE_DISCOUNTS;
import static com.tingeso.backend.configuration.DiscountConfig.MAX_DISCOUNT_LIMIT;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final TourPackageRepository tourPackageRepository;
    private final PromotionRepository promotionRepository;
    private final DiscountService discountService;

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
    public List<Reservation> findDateReports(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate.isAfter(endDate)) {
            throw new RuntimeException("Start date is after end date");
        }
        LocalDateTime startDateTime = startDate.withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endDateTime = endDate.withHour(23).withMinute(59).withSecond(59).withNano(0);
        return reservationRepository.findDateReports(startDateTime, endDateTime, ReservationState.CANCELED);
    }

    @Transactional(readOnly = true)
    public List<List<Reservation>> findRanking(LocalDateTime startDate, LocalDateTime endDate, Integer order, String type) {
        if (startDate.isAfter(endDate)) {
            throw new RuntimeException("Start date is after end date");
        }
        List<Reservation> reservations = findDateReports(startDate, endDate);
        Map<Long, List<Reservation>> groupedByPackage = reservations
                .stream()
                .collect(Collectors.groupingBy(Reservation::getTourPackageId));
        List<List<Reservation>> ranking = new ArrayList<>(groupedByPackage.values());
        ranking.sort((groupA, groupB) -> {
            int result;
            if ("passengers".equalsIgnoreCase(type)) {
                Long totalA = groupA.stream().mapToLong(Reservation::getPassengersAmount).sum();
                Long totalB = groupB.stream().mapToLong(Reservation::getPassengersAmount).sum();
                result = totalA.compareTo(totalB);
            }
            else {
                result = Integer.compare(groupA.size(), groupB.size());
            }
            if (result == 0) {
                BigDecimal revenueA = groupA.stream()
                        .map(Reservation::getPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal revenueB = groupB.stream()
                        .map(Reservation::getPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                result = revenueA.compareTo(revenueB);
            }
            if (result == 0 && !groupA.isEmpty() && !groupB.isEmpty()) {
                String nameA = groupA.getFirst().getTourPackageName();
                String nameB = groupB.getFirst().getTourPackageName();
                result = nameA.compareToIgnoreCase(nameB);
            }
            return (order == 1) ? result * -1 : result;
        });
        return ranking;
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
        reservation.setPrice(calculatePrice(reservation).getTotalAmount());
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
        if (reservation.getReservationState() == ReservationState.CONFIRMED
                || reservation.getReservationState() == ReservationState.COMPLETED
                || reservation.getReservationState() == ReservationState.IN_PROGRESS) {
            if (reservationSaved.getPaymentDate() != null) {
                reservationSaved.setReservationState(reservation.getReservationState());
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
        reservationSaved.setPrice(calculatePrice(reservation).getTotalAmount());
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

    public DiscountDataDTO calculatePrice(Reservation reservation) {
        TourPackage tourPackage = tourPackageRepository.findById(reservation.getTourPackageId())
                .orElseThrow(() -> new EntityNotFoundException("Tour package not found with id: " + reservation.getTourPackageId()));

        DiscountDataDTO discountDataDTO = new DiscountDataDTO();
        BigDecimal basePrice = tourPackage.getPrice();
        BigDecimal totalWithoutDiscounts = basePrice.multiply(BigDecimal.valueOf(reservation.getPassengersAmount()));

        discountDataDTO.setTotalAmountWithoutDiscounts(totalWithoutDiscounts.setScale(2, RoundingMode.HALF_UP));

        BigDecimal passengersDiscountPercentage = discountService.calculatePassengersAmountDiscount(reservation.getPassengersAmount());
        BigDecimal frequentClientDiscountPercentage = discountService.calculateFrequentClientDiscount(reservation.getUserEmail());
        BigDecimal multiplePackagesDiscountPercentage = discountService.calculateMultiplePackagesDiscount(reservation.getUserEmail());

        BigDecimal promotionDiscountPercentage = promotionRepository.findByTourPackageId(reservation.getTourPackageId())
                .map(Promotion::getDiscount)
                .orElse(BigDecimal.ZERO);

        discountDataDTO.setPassengersDiscount(totalWithoutDiscounts.multiply(passengersDiscountPercentage).setScale(2, RoundingMode.HALF_UP));
        discountDataDTO.setFrequentClientDiscount(totalWithoutDiscounts.multiply(frequentClientDiscountPercentage).setScale(2, RoundingMode.HALF_UP));
        discountDataDTO.setMultiplePackagesDiscount(totalWithoutDiscounts.multiply(multiplePackagesDiscountPercentage).setScale(2, RoundingMode.HALF_UP));
        discountDataDTO.setPromotionDiscount(totalWithoutDiscounts.multiply(promotionDiscountPercentage).setScale(2, RoundingMode.HALF_UP));

        BigDecimal accumulatedPercentage;
        if (COMBINABLE_DISCOUNTS) {
            accumulatedPercentage = passengersDiscountPercentage.add(frequentClientDiscountPercentage)
                    .add(multiplePackagesDiscountPercentage)
                    .add(promotionDiscountPercentage);
        } else {
            accumulatedPercentage = passengersDiscountPercentage.max(frequentClientDiscountPercentage)
                    .max(multiplePackagesDiscountPercentage)
                    .max(promotionDiscountPercentage);
        }

        if (accumulatedPercentage.subtract(MAX_DISCOUNT_LIMIT).compareTo(BigDecimal.ZERO) > 0) {
            accumulatedPercentage = MAX_DISCOUNT_LIMIT;
            discountDataDTO.setMaxDiscount(true);
        } else {
            discountDataDTO.setMaxDiscount(false);
        }

        BigDecimal finalDiscountAmount = totalWithoutDiscounts.multiply(accumulatedPercentage);
        BigDecimal totalWithDiscounts = totalWithoutDiscounts.subtract(finalDiscountAmount);

        discountDataDTO.setDiscountAmount(finalDiscountAmount.setScale(2, RoundingMode.HALF_UP));
        discountDataDTO.setTotalAmount(totalWithDiscounts.setScale(2, RoundingMode.HALF_UP));

        return discountDataDTO;
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cancelExpiredReservations() {
        LocalDateTime limit = LocalDateTime.now().minusHours(24);
        List<Reservation> expiredReservations = reservationRepository
                .findByReservationStateAndReservationDateBefore(ReservationState.PENDING, limit);
        expiredReservations.forEach(reservation -> {
            reservation.setReservationState(ReservationState.CANCELED);
            Optional<TourPackage> tourPackage = tourPackageRepository.findById(reservation.getTourPackageId());
            tourPackage.ifPresent(aPackage -> aPackage.setRemainingSpots(aPackage.getRemainingSpots() + reservation.getPassengersAmount()));
            tourPackage.ifPresent(aPackage -> aPackage.setTourPackageState(TourPackageState.AVAILABLE));
        });
        reservationRepository.saveAll(expiredReservations);
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void setReservationsState() {
        LocalDate today = LocalDate.now();
        List<Reservation> reservations = reservationRepository.findAll();
        reservations.forEach(reservation -> {
            Optional<TourPackage> tourPackage = tourPackageRepository.findById(reservation.getTourPackageId());
            if (tourPackage.isPresent()) {
                if ((today.isEqual(tourPackage.get().getStartDate()) || today.isAfter(tourPackage.get().getStartDate()))
                        && today.isBefore(tourPackage.get().getEndDate())) {
                    reservation.setReservationState(ReservationState.IN_PROGRESS);
                }
                else if (today.isEqual(tourPackage.get().getEndDate()) || today.isAfter(tourPackage.get().getEndDate())) {
                    reservation.setReservationState(ReservationState.COMPLETED);
                }
            }
        });
        reservationRepository.saveAll(reservations);
    }
}
