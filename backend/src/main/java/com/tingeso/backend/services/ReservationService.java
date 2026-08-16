package com.tingeso.backend.services;

import com.tingeso.backend.configuration.DiscountConfig;
import com.tingeso.backend.dto.DiscountDataDTO;
import com.tingeso.backend.dto.ReservationDTO;
import com.tingeso.backend.entities.*;
import com.tingeso.backend.enums.ReservationState;
import com.tingeso.backend.enums.TourPackageState;
import com.tingeso.backend.exceptions.BusinessRuleException;
import com.tingeso.backend.exceptions.ResourceNotFoundException;
import com.tingeso.backend.repositories.PromotionRepository;
import com.tingeso.backend.repositories.ReservationRepository;
import com.tingeso.backend.repositories.TourPackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final TourPackageRepository tourPackageRepository;
    private final PromotionRepository promotionRepository;
    private final DiscountService discountService;
    private final DiscountConfig discountConfig;

    private static final String RESERVATION_NOT_FOUND_MESSAGE = "Reservation not found with id: ";
    private static final String TOUR_PACKAGE_NOT_FOUND_MESSAGE = "Tour package not found with reservation id: ";

    @Transactional(readOnly = true)
    public List<ReservationDTO> findAll() {
        return reservationRepository.findAll()
                .stream()
                .map(this::reservationToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReservationDTO findById(Long id) {
        Optional<Reservation> reservation = reservationRepository.findById(id);
        if (reservation.isPresent()) {
            return reservationToDTO(reservation.get());
        } else throw new ResourceNotFoundException(RESERVATION_NOT_FOUND_MESSAGE + id);
    }

    @Transactional(readOnly = true)
    public List<ReservationDTO> findByUserEmail(String userEmail) {
        return reservationRepository.findByUserEmail(userEmail)
                .stream()
                .map(this::reservationToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservationDTO> findDateReports(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate.isAfter(endDate)) {
            throw new BusinessRuleException("Start date must be before end date");
        }
        LocalDateTime startDateTime = startDate.toLocalDate().atStartOfDay();
        LocalDateTime endDateTime = endDate.toLocalDate().atTime(LocalTime.MAX);
        return reservationRepository.findDateReports(startDateTime, endDateTime, ReservationState.CANCELED)
                .stream()
                .map(this::reservationToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<List<ReservationDTO>> findRanking(LocalDateTime startDate, LocalDateTime endDate, Integer order, String type) {
        if (startDate.isAfter(endDate)) {
            throw new BusinessRuleException("Start date must be before end date");
        }
        LocalDateTime startDateTime = startDate.toLocalDate().atStartOfDay();
        LocalDateTime endDateTime = endDate.toLocalDate().atTime(LocalTime.MAX);

        List<ReservationDTO> reservationsDTO = reservationRepository.findDateReports(startDateTime, endDateTime, ReservationState.CANCELED)
                .stream()
                .map(this::reservationToDTO)
                .toList();
        Map<Long, List<ReservationDTO>> groupedByPackage = reservationsDTO
                .stream()
                .collect(Collectors.groupingBy(ReservationDTO::tourPackageId));
        List<List<ReservationDTO>> ranking = new ArrayList<>(groupedByPackage.values());
        ranking.sort((groupA, groupB) -> {
            int result;
            if ("passengers".equalsIgnoreCase(type)) {
                Long totalA = groupA.stream().mapToLong(ReservationDTO::passengersAmount).sum();
                Long totalB = groupB.stream().mapToLong(ReservationDTO::passengersAmount).sum();
                result = totalA.compareTo(totalB);
            } else {
                result = Integer.compare(groupA.size(), groupB.size());
            }
            if (result == 0) {
                BigDecimal revenueA = groupA.stream()
                        .map(ReservationDTO::price)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal revenueB = groupB.stream()
                        .map(ReservationDTO::price)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                result = revenueA.compareTo(revenueB);
            }
            if (result == 0 && !groupA.isEmpty() && !groupB.isEmpty()) {
                String nameA = groupA.getFirst().tourPackageName();
                String nameB = groupB.getFirst().tourPackageName();
                result = nameA.compareToIgnoreCase(nameB);
            }
            return (order == 1) ? result * -1 : result;
        });
        return ranking;
    }

    @Transactional
    public ReservationDTO create(ReservationDTO reservationDTO) {
        TourPackage tourPackage = tourPackageRepository.findById(reservationDTO.tourPackageId())
                .orElseThrow(() -> new ResourceNotFoundException(TOUR_PACKAGE_NOT_FOUND_MESSAGE + reservationDTO.tourPackageId()));
        if (tourPackage.getTourPackageState() != TourPackageState.AVAILABLE) {
            throw new BusinessRuleException("Tour package not available for reservations because it is not available");
        }
        tourPackage.setRemainingSpots(tourPackage.getRemainingSpots() - reservationDTO.passengersAmount());
        if (tourPackage.getRemainingSpots() <= 0) {
            tourPackage.setTourPackageState(TourPackageState.SOLD_OUT);
        }
        Reservation reservation = new Reservation();
        reservation.setUserEmail(reservationDTO.userEmail());
        reservation.setTourPackageId(reservationDTO.tourPackageId());
        reservation.setTourPackageName(tourPackage.getName());
        reservation.setReservationState(reservationDTO.reservationState());
        reservation.setPrice(calculatePrice(reservationDTO).getTotalAmount());
        reservation.setReservationDate(LocalDateTime.now());
        reservation.setPaymentDate(reservationDTO.paymentDate());
        reservation.setPassengersAmount(reservationDTO.passengersAmount());
        reservation.setPreferences(reservationDTO.preferences());
        reservation.setSpecialRequests(reservationDTO.specialRequests());
        tourPackageRepository.save(tourPackage);
        return reservationToDTO(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationDTO update(ReservationDTO reservationDTO) {
        Reservation reservationSaved = reservationRepository.findById(reservationDTO.id())
                .orElseThrow(() -> new ResourceNotFoundException(RESERVATION_NOT_FOUND_MESSAGE + reservationDTO.id()));
        TourPackage tourPackage = tourPackageRepository.findById(reservationSaved.getTourPackageId())
                .orElseThrow(() -> new ResourceNotFoundException(TOUR_PACKAGE_NOT_FOUND_MESSAGE + reservationSaved.getTourPackageId()));
        if (reservationSaved.getReservationState() == ReservationState.CANCELED) {
            throw new BusinessRuleException("Cannot modify reservation because reservation is already canceled.");
        }
        if (reservationDTO.reservationState() == ReservationState.CONFIRMED
                || reservationDTO.reservationState() == ReservationState.COMPLETED
                || reservationDTO.reservationState() == ReservationState.IN_PROGRESS) {
            if (reservationSaved.getPaymentDate() != null) {
                reservationSaved.setReservationState(reservationDTO.reservationState());
            } else {
                throw new BusinessRuleException("Cannot modify reservation because payment date is null (not transaction done).");
            }
        }
        if (reservationDTO.reservationState() == ReservationState.CANCELED) {
            tourPackage.setRemainingSpots(tourPackage.getRemainingSpots() + reservationSaved.getPassengersAmount());
            tourPackage.setTourPackageState(TourPackageState.AVAILABLE);
        } else if (!Objects.equals(reservationSaved.getPassengersAmount(), reservationDTO.passengersAmount())) {
            int difference = reservationDTO.passengersAmount() - reservationSaved.getPassengersAmount();
            if (tourPackage.getRemainingSpots() < difference) {
                throw new BusinessRuleException("Not enough spots for reservation.");
            }
            tourPackage.setRemainingSpots(tourPackage.getRemainingSpots() - difference);
            tourPackage.setTourPackageState(tourPackage.getRemainingSpots() <= 0
                    ? TourPackageState.SOLD_OUT
                    : TourPackageState.AVAILABLE);
        }
        tourPackageRepository.save(tourPackage);
        reservationSaved.setPreferences(reservationDTO.preferences());
        reservationSaved.setSpecialRequests(reservationDTO.specialRequests());
        reservationSaved.setPassengersAmount(reservationDTO.passengersAmount());
        reservationSaved.setReservationState(reservationDTO.reservationState());
        reservationSaved.setPrice(calculatePrice(reservationDTO).getTotalAmount());
        return reservationToDTO(reservationRepository.save(reservationSaved));
    }

    @Transactional
    public void deleteById(Long id) {
        Reservation reservationSaved = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(RESERVATION_NOT_FOUND_MESSAGE + id));
        TourPackage tourPackage = tourPackageRepository.findById(reservationSaved.getTourPackageId())
                .orElseThrow(() -> new ResourceNotFoundException(TOUR_PACKAGE_NOT_FOUND_MESSAGE + reservationSaved.getTourPackageId()));
        if (reservationSaved.getReservationState() == ReservationState.CANCELED) {
            reservationRepository.deleteById(id);
            return;
        }
        tourPackage.setRemainingSpots(tourPackage.getRemainingSpots() + reservationSaved.getPassengersAmount());
        tourPackage.setTourPackageState(TourPackageState.AVAILABLE);
        tourPackageRepository.save(tourPackage);
        reservationRepository.deleteById(id);
    }

    public DiscountDataDTO calculatePrice(ReservationDTO reservationDTO) {
        TourPackage tourPackage = tourPackageRepository.findById(reservationDTO.tourPackageId())
                .orElseThrow(() -> new ResourceNotFoundException(TOUR_PACKAGE_NOT_FOUND_MESSAGE + reservationDTO.tourPackageId()));

        DiscountDataDTO discountDataDTO = new DiscountDataDTO();
        BigDecimal basePrice = tourPackage.getPrice();
        BigDecimal totalWithoutDiscounts = basePrice.multiply(BigDecimal.valueOf(reservationDTO.passengersAmount()));

        discountDataDTO.setTotalAmountWithoutDiscounts(totalWithoutDiscounts.setScale(2, RoundingMode.HALF_UP));

        BigDecimal passengersDiscountPercentage = discountService.calculatePassengersAmountDiscount(reservationDTO.passengersAmount());
        BigDecimal frequentClientDiscountPercentage = discountService.calculateFrequentClientDiscount(reservationDTO.userEmail());
        BigDecimal multiplePackagesDiscountPercentage = discountService.calculateMultiplePackagesDiscount(reservationDTO.userEmail());

        BigDecimal promotionDiscountPercentage = promotionRepository.findByTourPackageId(reservationDTO.tourPackageId())
                .map(Promotion::getDiscount)
                .orElse(BigDecimal.ZERO);

        discountDataDTO.setPassengersDiscount(totalWithoutDiscounts.multiply(passengersDiscountPercentage).setScale(2, RoundingMode.HALF_UP));
        discountDataDTO.setFrequentClientDiscount(totalWithoutDiscounts.multiply(frequentClientDiscountPercentage).setScale(2, RoundingMode.HALF_UP));
        discountDataDTO.setMultiplePackagesDiscount(totalWithoutDiscounts.multiply(multiplePackagesDiscountPercentage).setScale(2, RoundingMode.HALF_UP));
        discountDataDTO.setPromotionDiscount(totalWithoutDiscounts.multiply(promotionDiscountPercentage).setScale(2, RoundingMode.HALF_UP));

        BigDecimal accumulatedPercentage;
        if (discountConfig.isCombinableDiscounts()) {
            accumulatedPercentage = passengersDiscountPercentage.add(frequentClientDiscountPercentage)
                    .add(multiplePackagesDiscountPercentage)
                    .add(promotionDiscountPercentage);
        } else {
            accumulatedPercentage = passengersDiscountPercentage.max(frequentClientDiscountPercentage)
                    .max(multiplePackagesDiscountPercentage)
                    .max(promotionDiscountPercentage);
        }

        if (accumulatedPercentage.subtract(discountConfig.getMaxDiscountLimit()).compareTo(BigDecimal.ZERO) > 0) {
            accumulatedPercentage = discountConfig.getMaxDiscountLimit();
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
            if (tourPackage.isPresent() &&
                    (reservation.getReservationState() == ReservationState.CONFIRMED || reservation.getReservationState() == ReservationState.IN_PROGRESS)) {
                if ((today.isEqual(tourPackage.get().getStartDate()) || today.isAfter(tourPackage.get().getStartDate()))
                        && today.isBefore(tourPackage.get().getEndDate())) {
                    reservation.setReservationState(ReservationState.IN_PROGRESS);
                } else if (today.isEqual(tourPackage.get().getEndDate()) || today.isAfter(tourPackage.get().getEndDate())) {
                    reservation.setReservationState(ReservationState.COMPLETED);
                }
            }

        });
        reservationRepository.saveAll(reservations);
    }

    public ReservationDTO reservationToDTO(Reservation reservation) {
        return new ReservationDTO(
                reservation.getId(),
                reservation.getUserEmail(),
                reservation.getTourPackageId(),
                reservation.getTourPackageName(),
                reservation.getReservationState(),
                reservation.getPrice(),
                reservation.getReservationDate(),
                reservation.getPaymentDate(),
                reservation.getPassengersAmount(),
                reservation.getPreferences(),
                reservation.getSpecialRequests()
        );
    }
}
