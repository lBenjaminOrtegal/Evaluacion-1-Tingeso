package com.tingeso.backend.services;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.entities.ReservationState;
import com.tingeso.backend.repositories.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static com.tingeso.backend.configuration.DiscountConfig.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DiscountServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private DiscountService discountService;

    private Reservation completedReservation;
    private Reservation pendingReservation;
    private final String testEmail = "test@gmail.com";

    @BeforeEach
    void setUp() {
        completedReservation = new Reservation();
        completedReservation.setReservationState(ReservationState.COMPLETED);
        completedReservation.setReservationDate(LocalDateTime.now());

        pendingReservation = new Reservation();
        pendingReservation.setReservationState(ReservationState.PENDING);
        pendingReservation.setReservationDate(LocalDateTime.now());
    }

    // calculatePassengersAmountDiscount tests

    @Test
    void whenPassengersEqualThanMin_thenReturnDiscount() {
        BigDecimal result = discountService.calculatePassengersAmountDiscount(MIN_PASSENGERS);
        assertEquals(DISCOUNT_PASSENGERS, result);
    }

    @Test
    void whenPassengersGreaterOrEqualThanMin_thenReturnDiscount() {
        BigDecimal result = discountService.calculatePassengersAmountDiscount(MIN_PASSENGERS + 1);
        assertEquals(DISCOUNT_PASSENGERS, result);
    }

    @Test
    void whenPassengersLessThanMin_thenReturnZero() {
        BigDecimal result = discountService.calculatePassengersAmountDiscount(MIN_PASSENGERS - 1);
        assertEquals(BigDecimal.ZERO, result);
    }

    @Test
    void whenPassengersIsNull_thenReturnZero() {
        BigDecimal result = discountService.calculatePassengersAmountDiscount(null);
        assertEquals(BigDecimal.ZERO, result);
    }

    // calculateFrequentClientDiscount tests

    @Test
    void whenFrequentClientHasEnoughValidReservations_thenReturnDiscount() {
        List<Reservation> reservations = Arrays.asList(completedReservation, completedReservation, completedReservation);
        when(reservationRepository.findByUserEmail(testEmail)).thenReturn(reservations);
        BigDecimal result = discountService.calculateFrequentClientDiscount(testEmail);
        BigDecimal expected = reservations.size() >= MIN_RESERVATIONS ? DISCOUNT_RESERVATIONS : BigDecimal.ZERO;
        assertEquals(expected, result);
    }

    @Test
    void whenClientHasReservationsButArePending_thenReturnZero() {
        when(reservationRepository.findByUserEmail(testEmail)).thenReturn(Collections.singletonList(pendingReservation));
        BigDecimal result = discountService.calculateFrequentClientDiscount(testEmail);
        assertEquals(BigDecimal.ZERO, result);
    }

    // calculateMultiplePackagesDiscount tests

    @Test
    void whenRecentReservationsWithinWindow_thenReturnDiscount() {
        completedReservation.setReservationDate(LocalDateTime.now());
        List<Reservation> reservations = Collections.nCopies(MIN_RESERVATIONS_MULTIPLE_PACKAGES, completedReservation);
        when(reservationRepository.findByUserEmail(testEmail)).thenReturn(reservations);
        BigDecimal result = discountService.calculateMultiplePackagesDiscount(testEmail);
        assertEquals(DISCOUNT_MULTIPLE_PACKAGES, result);
    }

    @Test
    void whenRecentReservationsOutsideWindow_thenReturnZero() {
        Reservation oldReservation = new Reservation();
        oldReservation.setReservationState(ReservationState.CONFIRMED);
        oldReservation.setReservationDate(LocalDateTime.now().minusDays(DAYS_WINDOW + 1));
        when(reservationRepository.findByUserEmail(testEmail)).thenReturn(Collections.singletonList(oldReservation));
        BigDecimal result = discountService.calculateMultiplePackagesDiscount(testEmail);
        assertEquals(BigDecimal.ZERO, result);
    }

    // isCompletedReservation tests

    @Test
    void shouldReturnFalseWhenReservationIsPending() {
        Reservation reservation = new Reservation();
        reservation.setReservationState(ReservationState.PENDING);
        boolean result = discountService.isCompletedReservation(reservation);
        assertFalse(result);
    }

    @Test
    void shouldReturnFalseWhenReservationIsCanceled() {
        Reservation reservation = new Reservation();
        reservation.setReservationState(ReservationState.CANCELED);
        boolean result = discountService.isCompletedReservation(reservation);
        assertFalse(result);
    }

    @Test
    void shouldReturnTrueWhenReservationIsConfirmed() {
        Reservation reservation = new Reservation();
        reservation.setReservationState(ReservationState.CONFIRMED);
        boolean result = discountService.isCompletedReservation(reservation);
        assertTrue(result);
    }

    @Test
    void shouldReturnTrueWhenReservationIsCompleted() {
        Reservation reservation = new Reservation();
        reservation.setReservationState(ReservationState.COMPLETED);
        boolean result = discountService.isCompletedReservation(reservation);
        assertTrue(result);
    }

    @Test
    void shouldReturnTrueWhenReservationIsInProgress() {
        Reservation reservation = new Reservation();
        reservation.setReservationState(ReservationState.IN_PROGRESS);
        boolean result = discountService.isCompletedReservation(reservation);
        assertTrue(result);
    }
}