package com.tingeso.backend.services;

import com.tingeso.backend.dto.DiscountDataDTO;
import com.tingeso.backend.entities.*;
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
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

import static com.tingeso.backend.configuration.DiscountConfig.COMBINABLE_DISCOUNTS;
import static com.tingeso.backend.configuration.DiscountConfig.MAX_DISCOUNT_LIMIT;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock private ReservationRepository reservationRepository;
    @Mock private TourPackageRepository tourPackageRepository;
    @Mock private PromotionRepository promotionRepository;
    @Mock private DiscountService discountService;

    @InjectMocks private ReservationService reservationService;

    private Reservation reservation;
    private TourPackage tourPackage;

    @BeforeEach
    void setUp() {
        tourPackage = new TourPackage();
        tourPackage.setId(10L);
        tourPackage.setName("Test Package");
        tourPackage.setPrice(BigDecimal.valueOf(1000));
        tourPackage.setRemainingSpots(10);
        tourPackage.setTourPackageState(TourPackageState.AVAILABLE);

        reservation = new Reservation();
        reservation.setId(1L);
        reservation.setTourPackageId(10L);
        reservation.setPassengersAmount(2);
        reservation.setUserEmail("user@test.com");
        reservation.setReservationState(ReservationState.PENDING);
    }

    // findById test

    @Test
    void findById_ReturnsReservation() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        assertNotNull(reservationService.findById(1L));
    }

    // findAll test

    @Test
    void findAll_ReturnsList() {
        when(reservationRepository.findAll()).thenReturn(Collections.singletonList(reservation));
        assertFalse(reservationService.findAll().isEmpty());
    }

    // findByUserEmail test

    @Test
    void findByUserEmail_ReturnsReservation() {
        when(reservationRepository.findByUserEmail("test@gmail.com")).thenReturn(Collections.singletonList(reservation));
        assertFalse(reservationService.findByUserEmail("test@gmail.com").isEmpty());
    }

    // findDateReports tests

    @Test
    void findDateReports_ThrowsException_WhenDatesInvalid() {
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.minusDays(1);
        assertThrows(RuntimeException.class, () -> reservationService.findDateReports(start, end));
    }

    @Test
    void findDateReports_Successful() {
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusDays(1);
        assertDoesNotThrow(() -> reservationService.findDateReports(start, end));
    }

    // findRanking tests

    @Test
    void findRanking_ThrowsException_WhenDatesInvalid() {
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.minusDays(1);
        assertThrows(RuntimeException.class, () -> reservationService.findRanking(start, end, 1, "passengers"));
    }

    @Test
    void findRanking_SortsByPassengersCorrectly() {
        LocalDateTime start = LocalDateTime.now().minusDays(5);
        LocalDateTime end = LocalDateTime.now();
        Reservation res1 = new Reservation();
        res1.setTourPackageId(1L); res1.setPassengersAmount(10); res1.setPrice(BigDecimal.valueOf(100));
        Reservation res2 = new Reservation();
        res2.setTourPackageId(2L); res2.setPassengersAmount(5); res2.setPrice(BigDecimal.valueOf(50));
        when(reservationRepository.findDateReports(any(), any(), any())).thenReturn(Arrays.asList(res1, res2));
        List<List<Reservation>> result = reservationService.findRanking(start, end, 1, "passengers");
        assertEquals(2, result.size());
        assertEquals(10, result.getFirst().getFirst().getPassengersAmount());
    }

    @Test
    void findRanking_SortsByReservationsCorrectly() {
        LocalDateTime start = LocalDateTime.now().minusDays(5);
        LocalDateTime end = LocalDateTime.now();
        Reservation res1 = new Reservation();
        res1.setTourPackageId(1L);
        res1.setPassengersAmount(10);
        res1.setPrice(BigDecimal.valueOf(100));
        Reservation res2a = new Reservation();
        res2a.setTourPackageId(2L);
        res2a.setPassengersAmount(1);
        res2a.setPrice(BigDecimal.valueOf(10));
        Reservation res2b = new Reservation();
        res2b.setTourPackageId(2L);
        res2b.setPassengersAmount(1);
        res2b.setPrice(BigDecimal.valueOf(10));
        when(reservationRepository.findDateReports(any(), any(), any()))
                .thenReturn(Arrays.asList(res1, res2a, res2b));
        List<List<Reservation>> result = reservationService.findRanking(start, end, 1, "reservations");
        assertEquals(2, result.size());
        assertEquals(2L, result.getFirst().getFirst().getTourPackageId());
        assertEquals(2, result.getFirst().size());
    }

    @Test
    void findRanking_TieInPassengers_SortsByRevenue() {
        LocalDateTime start = LocalDateTime.now().minusDays(5);
        LocalDateTime end = LocalDateTime.now();
        Reservation resA = new Reservation();
        resA.setTourPackageId(1L);
        resA.setPassengersAmount(10);
        resA.setPrice(BigDecimal.valueOf(500));
        Reservation resB = new Reservation();
        resB.setTourPackageId(2L);
        resB.setPassengersAmount(10);
        resB.setPrice(BigDecimal.valueOf(1000));
        when(reservationRepository.findDateReports(any(), any(), any()))
                .thenReturn(Arrays.asList(resA, resB));
        List<List<Reservation>> result = reservationService.findRanking(start, end, 1, "passengers");
        assertEquals(2, result.size());
        assertEquals(2L, result.getFirst().getFirst().getTourPackageId());
    }

    @Test
    void findRanking_TieInPassengersAndRevenue_SortsByName() {
        LocalDateTime start = LocalDateTime.now().minusDays(5);
        LocalDateTime end = LocalDateTime.now();
        Reservation resA = new Reservation();
        resA.setTourPackageId(1L);
        resA.setTourPackageName("Zacinto");
        resA.setPassengersAmount(5);
        resA.setPrice(BigDecimal.valueOf(500));
        Reservation resB = new Reservation();
        resB.setTourPackageId(2L);
        resB.setTourPackageName("Alpes");
        resB.setPassengersAmount(5);
        resB.setPrice(BigDecimal.valueOf(500));
        when(reservationRepository.findDateReports(any(), any(), any()))
                .thenReturn(Arrays.asList(resA, resB));
        List<List<Reservation>> result = reservationService.findRanking(start, end, 0, "passengers");
        assertEquals(2, result.size());
        assertEquals("Alpes", result.get(0).getFirst().getTourPackageName());
        assertEquals("Zacinto", result.get(1).getFirst().getTourPackageName());
    }

    // create tests

    @Test
    void create_Success_UpdatesSpots() {
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(tourPackage));
        when(reservationRepository.save(any())).thenReturn(reservation);
        when(discountService.calculatePassengersAmountDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateFrequentClientDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateMultiplePackagesDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(promotionRepository.findByTourPackageId(10L)).thenReturn(Optional.empty());
        Reservation created = reservationService.create(reservation);
        assertEquals(8, tourPackage.getRemainingSpots());
        verify(tourPackageRepository).save(tourPackage);
    }

    @Test
    void create_WhenRemainingSpotsReachZero_ThenStateIsSoldOut() {
        TourPackage pkg = new TourPackage();
        pkg.setId(10L);
        pkg.setName("Test Package");
        pkg.setRemainingSpots(5);
        pkg.setTourPackageState(TourPackageState.AVAILABLE);
        pkg.setPrice(BigDecimal.valueOf(100));
        Reservation resRequest = new Reservation();
        resRequest.setTourPackageId(10L);
        resRequest.setPassengersAmount(5);
        resRequest.setUserEmail("test@gmail.com");
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(pkg));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(resRequest);
        when(discountService.calculatePassengersAmountDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateFrequentClientDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateMultiplePackagesDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(promotionRepository.findByTourPackageId(10L)).thenReturn(Optional.empty());
        reservationService.create(resRequest);
        assertEquals(0, pkg.getRemainingSpots());
        assertEquals(TourPackageState.SOLD_OUT, pkg.getTourPackageState());
        verify(tourPackageRepository).save(pkg);
    }

    @Test
    void create_ThrowsException_WhenPackageNotAvailable() {
        tourPackage.setTourPackageState(TourPackageState.SOLD_OUT);
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(tourPackage));
        assertThrows(IllegalStateException.class, () -> reservationService.create(reservation));
    }

    // update tests

    @Test
    void update_WhenReservationAlreadyCanceled_ThrowsIllegalStateException() {
        Reservation reservationInDb = new Reservation();
        reservationInDb.setId(1L);
        reservationInDb.setTourPackageId(10L);
        reservationInDb.setReservationState(ReservationState.CANCELED);
        Reservation updateRequest = new Reservation();
        updateRequest.setId(1L);
        updateRequest.setReservationState(ReservationState.CONFIRMED);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservationInDb));
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(tourPackage));
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            reservationService.update(updateRequest);
        });
        assertTrue(exception.getMessage().contains("already canceled"));
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void update_CancelReservation_RestoresSpots() {
        Long tourPackageId = 10L;
        tourPackage.setId(tourPackageId);
        tourPackage.setRemainingSpots(10);
        tourPackage.setTourPackageState(TourPackageState.SOLD_OUT);
        Reservation savedRes = new Reservation();
        savedRes.setId(1L);
        savedRes.setTourPackageId(tourPackageId);
        savedRes.setPassengersAmount(2);
        savedRes.setUserEmail("test@gmail.com");
        savedRes.setReservationState(ReservationState.PENDING);
        Reservation updateInfo = new Reservation();
        updateInfo.setId(1L);
        updateInfo.setReservationState(ReservationState.CANCELED);
        updateInfo.setPassengersAmount(2);
        updateInfo.setTourPackageId(tourPackageId);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(savedRes));
        when(tourPackageRepository.findById(tourPackageId)).thenReturn(Optional.of(tourPackage));
        when(discountService.calculatePassengersAmountDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateFrequentClientDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateMultiplePackagesDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(promotionRepository.findByTourPackageId(any())).thenReturn(Optional.empty());
        when(reservationRepository.save(any(Reservation.class))).thenReturn(savedRes);
        reservationService.update(updateInfo);
        assertEquals(12, tourPackage.getRemainingSpots());
        assertEquals(TourPackageState.AVAILABLE, tourPackage.getTourPackageState());
        verify(tourPackageRepository).save(tourPackage);
    }

    @Test
    void update_ThrowsException_WhenPaymentDateNullAndConfirming() {
        reservation.setReservationState(ReservationState.PENDING);
        reservation.setPaymentDate(null);
        Reservation updateInfo = new Reservation();
        updateInfo.setId(1L);
        updateInfo.setReservationState(ReservationState.CONFIRMED);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(tourPackage));
        assertThrows(IllegalStateException.class, () -> reservationService.update(updateInfo));
    }

    @Test
    void update_ReservationStateChange_WhenPaymentDateAndConfirming() {
        reservation.setId(1L);
        reservation.setTourPackageId(10L);
        reservation.setReservationState(ReservationState.PENDING);
        reservation.setPaymentDate(LocalDateTime.now());
        reservation.setPassengersAmount(2);
        Reservation updateInfo = new Reservation();
        updateInfo.setId(1L);
        updateInfo.setTourPackageId(10L);
        updateInfo.setReservationState(ReservationState.CONFIRMED);
        updateInfo.setPassengersAmount(2);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(tourPackage));
        when(discountService.calculatePassengersAmountDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateFrequentClientDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateMultiplePackagesDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(promotionRepository.findByTourPackageId(any())).thenReturn(Optional.empty());
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);
        Reservation result = reservationService.update(updateInfo);
        assertNotNull(result);
        assertEquals(ReservationState.CONFIRMED, result.getReservationState());
        verify(reservationRepository, times(1)).save(any(Reservation.class));
    }

    @Test
    void update_WhenPassengersAmountChanges_AndSpotsAvailable_ShouldUpdateSpots() {
        Long tourPackageId = 10L;
        tourPackage.setId(tourPackageId);
        tourPackage.setRemainingSpots(10);
        tourPackage.setTourPackageState(TourPackageState.AVAILABLE);
        Reservation reservationInDb = new Reservation();
        reservationInDb.setId(1L);
        reservationInDb.setTourPackageId(tourPackageId);
        reservationInDb.setPassengersAmount(2);
        reservationInDb.setReservationState(ReservationState.PENDING);
        Reservation updateRequest = new Reservation();
        updateRequest.setId(1L);
        updateRequest.setTourPackageId(tourPackageId);
        updateRequest.setPassengersAmount(5);
        updateRequest.setReservationState(ReservationState.PENDING);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservationInDb));
        when(tourPackageRepository.findById(tourPackageId)).thenReturn(Optional.of(tourPackage));
        when(discountService.calculatePassengersAmountDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateFrequentClientDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(discountService.calculateMultiplePackagesDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(promotionRepository.findByTourPackageId(any())).thenReturn(Optional.empty());
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservationInDb);
        Reservation result = reservationService.update(updateRequest);
        assertEquals(7, tourPackage.getRemainingSpots());
        assertEquals(5, result.getPassengersAmount());
        verify(tourPackageRepository).save(tourPackage);
    }

    @Test
    void update_WhenPassengersAmountIncreases_AndNoSpotsAvailable_ShouldThrowException() {
        Long tourPackageId = 10L;
        tourPackage.setId(tourPackageId);
        tourPackage.setRemainingSpots(1);
        tourPackage.setTourPackageState(TourPackageState.AVAILABLE);
        Reservation reservationInDb = new Reservation();
        reservationInDb.setId(1L);
        reservationInDb.setTourPackageId(tourPackageId);
        reservationInDb.setPassengersAmount(2);
        Reservation updateRequest = new Reservation();
        updateRequest.setId(1L);
        updateRequest.setTourPackageId(tourPackageId);
        updateRequest.setPassengersAmount(5);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservationInDb));
        when(tourPackageRepository.findById(tourPackageId)).thenReturn(Optional.of(tourPackage));
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            reservationService.update(updateRequest);
        });
        assertTrue(exception.getMessage().contains("Not enough spots"));
        verify(tourPackageRepository, never()).save(any());
    }

    // deleteById tests

    @Test
    void deleteById_NoReservationFound() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.empty());
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            reservationService.deleteById(1L);
        });
        assertTrue(exception.getMessage().contains("Reservation not found"));
        verify(reservationRepository, never()).deleteById(any());
    }

    @Test
    void deleteById_ReservationFoundButNotTourPackage() {
        Reservation savedRes = new Reservation();
        savedRes.setId(1L);
        savedRes.setTourPackageId(10L);
        savedRes.setPassengersAmount(2);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(savedRes));
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.empty());
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            reservationService.deleteById(1L);
        });
        assertTrue(exception.getMessage().contains("Tour package not found"));
        verify(tourPackageRepository, never()).save(any());
    }

    @Test
    void deleteById_DeletedSuccessful() {
        Reservation savedRes = new Reservation();
        savedRes.setId(1L);
        savedRes.setTourPackageId(10L);
        savedRes.setPassengersAmount(2);
        TourPackage pkg = new TourPackage();
        pkg.setId(10L);
        pkg.setRemainingSpots(5);
        pkg.setTourPackageState(TourPackageState.SOLD_OUT);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(savedRes));
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(pkg));
        reservationService.deleteById(1L);
        assertEquals(7, pkg.getRemainingSpots()); // 5 + 2
        assertEquals(TourPackageState.AVAILABLE, pkg.getTourPackageState());
        verify(tourPackageRepository).save(pkg);
        verify(reservationRepository).deleteById(1L);
    }

    // calculatePrice test

    @Test
    void calculatePrice_AppliesMaxDiscountLimit() {
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(tourPackage));
        when(discountService.calculatePassengersAmountDiscount(any())).thenReturn(new BigDecimal("0.4"));
        when(discountService.calculateFrequentClientDiscount(any())).thenReturn(new BigDecimal("0.3"));
        when(discountService.calculateMultiplePackagesDiscount(any())).thenReturn(BigDecimal.ZERO);
        when(promotionRepository.findByTourPackageId(10L)).thenReturn(Optional.empty());
        DiscountDataDTO result = reservationService.calculatePrice(reservation);
        assertTrue(result.getMaxDiscount());
        BigDecimal expectedDiscount = BigDecimal.valueOf(2000).multiply(MAX_DISCOUNT_LIMIT).setScale(0, RoundingMode.HALF_UP);
        BigDecimal expectedTotal = BigDecimal.valueOf(2000).subtract(expectedDiscount).setScale(0, RoundingMode.HALF_UP);
        assertEquals(expectedTotal, result.getTotalAmount());
    }

    // cancelExpiredReservations test

    @Test
    void cancelExpiredReservations_ProcessesList() {
        List<Reservation> expired = Collections.singletonList(reservation);
        when(reservationRepository.findByReservationStateAndReservationDateBefore(any(), any()))
                .thenReturn(expired);
        when(tourPackageRepository.findById(10L)).thenReturn(Optional.of(tourPackage));
        reservationService.cancelExpiredReservations();
        assertEquals(ReservationState.CANCELED, reservation.getReservationState());
        assertEquals(12, tourPackage.getRemainingSpots());
        verify(reservationRepository).saveAll(any());
    }
}