package com.tingeso.backend.services;

import com.tingeso.backend.configuration.DiscountConfig;
import com.tingeso.backend.dto.DiscountDataDTO;
import com.tingeso.backend.dto.ReservationDTO;
import com.tingeso.backend.entities.*;
import com.tingeso.backend.enums.ReservationState;
import com.tingeso.backend.enums.TourPackageState;
import com.tingeso.backend.exceptions.BusinessRuleException;
import com.tingeso.backend.repositories.PromotionRepository;
import com.tingeso.backend.repositories.ReservationRepository;
import com.tingeso.backend.repositories.TourPackageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private TourPackageRepository tourPackageRepository;
    @Mock
    private PromotionRepository promotionRepository;
    @Mock
    private DiscountService discountService;
    @Mock
    private DiscountConfig discountConfig;

    @InjectMocks
    private ReservationService reservationService;

    private Reservation reservation;
    private TourPackage tourPackage;
    private ReservationDTO reservationDTO;

    @BeforeEach
    void setUp() {
        tourPackage = new TourPackage();
        tourPackage.setId(10L);
        tourPackage.setName("Europa Mágica");
        tourPackage.setPrice(BigDecimal.valueOf(1000));
        tourPackage.setRemainingSpots(10);
        tourPackage.setTourPackageState(TourPackageState.AVAILABLE);
        tourPackage.setStartDate(LocalDate.now().plusDays(5));
        tourPackage.setEndDate(LocalDate.now().plusDays(15));

        reservation = new Reservation();
        reservation.setId(1L);
        reservation.setTourPackageId(10L);
        reservation.setPassengersAmount(2);
        String testEmail = "user@test.com";
        reservation.setUserEmail(testEmail);
        reservation.setReservationState(ReservationState.PENDING);

        reservationDTO = reservationService.reservationToDTO(reservation);
    }

    @Test
    void findAll_ShouldReturnList() {
        when(reservationRepository.findAll()).thenReturn(List.of(reservation));
        List<ReservationDTO> result = reservationService.findAll();
        assertEquals(1, result.size());
    }

    @Test
    void findById_WhenExists_ShouldReturnReservation() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        ReservationDTO result = reservationService.findById(1L);
        assertNotNull(result);
    }

    @Test
    void findDateReports_WhenStartDateAfterEndDate_ShouldThrowException() {
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = LocalDateTime.now();
        assertThrows(RuntimeException.class, () -> reservationService.findDateReports(start, end));
    }

    @Test
    void findRanking_ShouldSortAndGroupCorrectly() {
        LocalDateTime start = LocalDateTime.now().minusDays(5);
        LocalDateTime end = LocalDateTime.now().plusDays(5);
        Reservation r1 = new Reservation(); r1.setTourPackageId(10L); r1.setPassengersAmount(2); r1.setPrice(BigDecimal.valueOf(2000)); r1.setTourPackageName("A");
        Reservation r2 = new Reservation(); r2.setTourPackageId(20L); r2.setPassengersAmount(5); r2.setPrice(BigDecimal.valueOf(5000)); r2.setTourPackageName("B");
        when(reservationRepository.findDateReports(any(), any(), any())).thenReturn(Arrays.asList(r1, r2));
        List<List<ReservationDTO>> ranking = reservationService.findRanking(start, end, 0, "passengers");
        assertEquals(10L, ranking.get(0).getFirst().tourPackageId());
        assertEquals(20L, ranking.get(1).getFirst().tourPackageId());
    }

    @Test
    void create_WhenPackageNotFound_ShouldThrowException() {
        when(tourPackageRepository.findById(any())).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> reservationService.create(reservationDTO));
    }

    @Test
    void create_WhenPackageNotAvailable_ShouldThrowIllegalStateException() {
        tourPackage.setTourPackageState(TourPackageState.SOLD_OUT);
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(tourPackage));
        assertThrows(BusinessRuleException.class, () -> reservationService.create(reservationDTO));
    }

    @Test
    void create_Success_ShouldReduceSpotsAndMarkSoldOutIfZero() {
        tourPackage.setRemainingSpots(10);
        reservation.setPassengersAmount(10);
        reservationDTO = reservationService.reservationToDTO(reservation);
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(tourPackage));
        when(discountConfig.getMaxDiscountLimit()).thenReturn(new BigDecimal("0.25"));
        when(discountService.calculatePassengersAmountDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateFrequentClientDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateMultiplePackagesDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(promotionRepository.findByTourPackageId(10L)).thenReturn(Optional.empty());
        when(reservationRepository.save(any())).thenReturn(reservation);
        ReservationDTO result = reservationService.create(reservationDTO);
        assertNotNull(result);
        assertEquals(0, tourPackage.getRemainingSpots());
        assertEquals(TourPackageState.SOLD_OUT, tourPackage.getTourPackageState());
        verify(tourPackageRepository).save(tourPackage);
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    void update_WhenSavedReservationIsCanceled_ShouldThrowException() {
        Reservation reservationInDb = new Reservation();
        reservationInDb.setReservationState(ReservationState.CANCELED);
        when(reservationRepository.findById(any())).thenReturn(Optional.of(reservationInDb));
        when(tourPackageRepository.findById(any())).thenReturn(Optional.of(tourPackage));
        assertThrows(BusinessRuleException.class, () -> reservationService.update(reservationDTO));
    }

    @Test
    void update_WhenConfirmingWithoutPaymentDate_ShouldThrowException() {
        Reservation reservationInDb = new Reservation();
        reservationInDb.setReservationState(ReservationState.PENDING);
        reservationInDb.setPaymentDate(null);
        when(reservationRepository.findById(any())).thenReturn(Optional.of(reservationInDb));
        when(tourPackageRepository.findById(any())).thenReturn(Optional.of(tourPackage));
        reservation.setReservationState(ReservationState.CONFIRMED);
        reservationDTO = reservationService.reservationToDTO(reservation);
        assertThrows(BusinessRuleException.class, () -> reservationService.update(reservationDTO));
    }

    @Test
    void update_WhenCanceling_ShouldRestoreSpots() {
        Reservation reservationInDb = new Reservation();
        reservationInDb.setId(1L);
        reservationInDb.setReservationState(ReservationState.PENDING);
        reservationInDb.setPassengersAmount(3);
        reservationInDb.setTourPackageId(10L);
        when(reservationRepository.findById(any())).thenReturn(Optional.of(reservationInDb));
        when(tourPackageRepository.findById(any())).thenReturn(Optional.of(tourPackage));
        when(reservationRepository.save(any())).thenReturn(reservationInDb);
        when(discountConfig.getMaxDiscountLimit()).thenReturn(new BigDecimal("0.25"));
        when(discountService.calculatePassengersAmountDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateFrequentClientDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateMultiplePackagesDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(promotionRepository.findByTourPackageId(any())).thenReturn(Optional.empty());
        reservation.setReservationState(ReservationState.CANCELED);
        reservation.setPassengersAmount(3);
        reservationDTO = reservationService.reservationToDTO(reservation);
        reservationService.update(reservationDTO);
        assertEquals(13, tourPackage.getRemainingSpots());
        assertEquals(TourPackageState.AVAILABLE, tourPackage.getTourPackageState());
        verify(tourPackageRepository).save(tourPackage);
    }

    @Test
    void update_WhenChangingPassengersAndNotEnoughSpots_ShouldThrowException() {
        Reservation reservationInDb = new Reservation();
        reservationInDb.setPassengersAmount(2);
        reservationInDb.setTourPackageId(10L);
        when(reservationRepository.findById(any())).thenReturn(Optional.of(reservationInDb));
        when(tourPackageRepository.findById(any())).thenReturn(Optional.of(tourPackage));
        reservation.setPassengersAmount(15);
        reservationDTO = reservationService.reservationToDTO(reservation);
        assertThrows(BusinessRuleException.class, () -> reservationService.update(reservationDTO));
    }

    @Test
    void deleteById_ShouldRestoreSpotsAndDestroy() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(tourPackage));
        reservationService.deleteById(1L);
        assertEquals(12, tourPackage.getRemainingSpots());
        verify(reservationRepository).deleteById(1L);
    }

    @Test
    void calculatePrice_WhenDiscountsAreCombinableAndExceedMax_ShouldCapAtMax() {
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(tourPackage));
        when(discountConfig.isCombinableDiscounts()).thenReturn(true);
        when(discountConfig.getMaxDiscountLimit()).thenReturn(new BigDecimal("0.20"));
        when(discountService.calculatePassengersAmountDiscount(any())).thenReturn(new BigDecimal("0.15"));
        when(discountService.calculateFrequentClientDiscount(any())).thenReturn(new BigDecimal("0.10"));
        when(discountService.calculateMultiplePackagesDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(promotionRepository.findByTourPackageId(10L)).thenReturn(Optional.empty());
        DiscountDataDTO result = reservationService.calculatePrice(reservationDTO);
        assertTrue(result.getMaxDiscount());
        assertEquals(new BigDecimal("400.00"), result.getDiscountAmount());
        assertEquals(new BigDecimal("1600.00"), result.getTotalAmount());
    }

    @Test
    void calculatePrice_WhenDiscountsNotCombinable_ShouldTakeTheMax() {
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(tourPackage));
        when(discountConfig.isCombinableDiscounts()).thenReturn(false);
        when(discountConfig.getMaxDiscountLimit()).thenReturn(new BigDecimal("0.50"));
        when(discountService.calculatePassengersAmountDiscount(any())).thenReturn(new BigDecimal("0.05"));
        when(discountService.calculateFrequentClientDiscount(any())).thenReturn(new BigDecimal("0.12"));
        when(discountService.calculateMultiplePackagesDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(promotionRepository.findByTourPackageId(10L)).thenReturn(Optional.empty());
        DiscountDataDTO result = reservationService.calculatePrice(reservationDTO);
        assertFalse(result.getMaxDiscount());
        assertEquals(new BigDecimal("240.00"), result.getDiscountAmount());
        assertEquals(new BigDecimal("1760.00"), result.getTotalAmount());
    }

    @Test
    void cancelExpiredReservations_ShouldCancelOnlyOldPendingOnes() {
        Reservation expiredRes = new Reservation();
        expiredRes.setReservationState(ReservationState.PENDING);
        expiredRes.setPassengersAmount(2);
        expiredRes.setTourPackageId(10L);
        when(reservationRepository.findByReservationStateAndReservationDateBefore(any(), any()))
                .thenReturn(List.of(expiredRes));
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(tourPackage));
        reservationService.cancelExpiredReservations();
        assertEquals(ReservationState.CANCELED, expiredRes.getReservationState());
        assertEquals(12, tourPackage.getRemainingSpots());
        verify(reservationRepository).saveAll(any());
    }

    @Test
    void setReservationsState_ShouldTransitionStatesBasedOnDates() {
        Reservation r1 = new Reservation();
        r1.setTourPackageId(10L);
        r1.setReservationState(ReservationState.CONFIRMED);
        Reservation r2 = new Reservation();
        r2.setTourPackageId(20L);
        r2.setReservationState(ReservationState.IN_PROGRESS);
        TourPackage pkgInProgress = new TourPackage();
        pkgInProgress.setStartDate(LocalDate.now().minusDays(1));
        pkgInProgress.setEndDate(LocalDate.now().plusDays(5));
        TourPackage pkgCompleted = new TourPackage();
        pkgCompleted.setStartDate(LocalDate.now().minusDays(10));
        pkgCompleted.setEndDate(LocalDate.now().minusDays(1));
        when(reservationRepository.findAll()).thenReturn(Arrays.asList(r1, r2));
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(pkgInProgress));
        when(tourPackageRepository.findById(20L)).thenReturn(Optional.of(pkgCompleted));
        reservationService.setReservationsState();
        assertEquals(ReservationState.IN_PROGRESS, r1.getReservationState());
        assertEquals(ReservationState.COMPLETED, r2.getReservationState());
        verify(reservationRepository).saveAll(anyList());
    }
}