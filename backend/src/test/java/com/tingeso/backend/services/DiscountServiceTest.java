package com.tingeso.backend.services;

import com.tingeso.backend.configuration.DiscountConfig;
import com.tingeso.backend.entities.Discount;
import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.entities.ReservationState;
import com.tingeso.backend.repositories.DiscountRepository;
import com.tingeso.backend.repositories.ReservationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiscountServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private DiscountRepository discountRepository;

    @Mock
    private DiscountConfig discountConfig;

    @InjectMocks
    private DiscountService discountService;

    private Discount existingDiscount;
    private Discount updateRequest;
    private Reservation completedReservation;
    private Reservation pendingReservation;
    private final String testEmail = "test@gmail.com";

    @BeforeEach
    void setUp() {
        existingDiscount = new Discount(
                1L, true, new BigDecimal("0.25"),
                4, new BigDecimal("0.05"),
                3, new BigDecimal("0.10"),
                7, 3, new BigDecimal("0.15")
        );

        updateRequest = new Discount(
                1L, false, new BigDecimal("0.30"),
                5, new BigDecimal("0.08"),
                4, new BigDecimal("0.12"),
                10, 5, new BigDecimal("0.20")
        );

        completedReservation = new Reservation();
        completedReservation.setReservationState(ReservationState.COMPLETED);
        completedReservation.setReservationDate(LocalDateTime.now());

        pendingReservation = new Reservation();
        pendingReservation.setReservationState(ReservationState.PENDING);
        pendingReservation.setReservationDate(LocalDateTime.now());
    }

    @Test
    void whenDiscountExists_thenFindDiscountShouldReturnIt() {
        when(discountRepository.findById(1L)).thenReturn(Optional.of(existingDiscount));
        Discount result = discountService.findDiscount();
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(discountRepository, times(1)).findById(1L);
    }

    @Test
    void whenDiscountDoesNotExist_thenFindDiscountShouldReturnNull() {
        when(discountRepository.findById(1L)).thenReturn(Optional.empty());
        Discount result = discountService.findDiscount();
        assertNull(result);
        verify(discountRepository, times(1)).findById(1L);
    }

    @Test
    void whenDiscountExists_thenUpdateShouldModifyFieldsAndSave() {
        when(discountRepository.findById(1L)).thenReturn(Optional.of(existingDiscount));
        when(discountRepository.save(any(Discount.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Discount result = discountService.update(updateRequest);
        assertNotNull(result);
        assertFalse(result.isCombinableDiscounts());
        assertEquals(new BigDecimal("0.30"), result.getMaxDiscountLimit());
        assertEquals(5, result.getMinPassengers());
        assertEquals(new BigDecimal("0.08"), result.getDiscountPassengers());
        assertEquals(4, result.getMinReservations());
        assertEquals(new BigDecimal("0.12"), result.getDiscountReservations());
        assertEquals(10, result.getDaysWindow());
        assertEquals(5, result.getMinReservationsMultiplePackages());
        assertEquals(new BigDecimal("0.20"), result.getDiscountMultiplePackages());
        verify(discountRepository, times(1)).findById(1L);
        verify(discountRepository, times(1)).save(existingDiscount);
    }

    @Test
    void whenDiscountDoesNotExist_thenUpdateShouldThrowEntityNotFoundException() {
        when(discountRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> discountService.update(updateRequest));
        verify(discountRepository, never()).save(any(Discount.class));
    }

    @Test
    void whenPassengersEqualOrGreaterChange_thenReturnDiscount() {
        when(discountConfig.getMinPassengers()).thenReturn(4);
        when(discountConfig.getDiscountPassengers()).thenReturn(new BigDecimal("0.05"));
        BigDecimal resultEqual = discountService.calculatePassengersAmountDiscount(4);
        BigDecimal resultGreater = discountService.calculatePassengersAmountDiscount(5);
        assertEquals(new BigDecimal("0.05"), resultEqual);
        assertEquals(new BigDecimal("0.05"), resultGreater);
    }

    @Test
    void whenPassengersLessThanMin_thenReturnZero() {
        when(discountConfig.getMinPassengers()).thenReturn(4);
        BigDecimal result = discountService.calculatePassengersAmountDiscount(3);
        assertEquals(BigDecimal.ZERO, result);
    }

    @Test
    void whenPassengersIsNull_thenReturnZero() {
        BigDecimal result = discountService.calculatePassengersAmountDiscount(null);
        assertEquals(BigDecimal.ZERO, result);
    }

    @Test
    void whenClientHasEnoughValidReservations_thenReturnDiscount() {
        when(discountConfig.getMinReservations()).thenReturn(3);
        when(discountConfig.getDiscountReservations()).thenReturn(new BigDecimal("0.10"));
        List<Reservation> reservations = Arrays.asList(completedReservation, completedReservation, completedReservation);
        when(reservationRepository.findByUserEmail(testEmail)).thenReturn(reservations);
        BigDecimal result = discountService.calculateFrequentClientDiscount(testEmail);
        assertEquals(new BigDecimal("0.10"), result);
    }

    @Test
    void whenClientHasReservationsButNotEnoughValid_thenReturnZero() {
        when(discountConfig.getMinReservations()).thenReturn(3);
        List<Reservation> reservations = Arrays.asList(completedReservation, pendingReservation, completedReservation);
        when(reservationRepository.findByUserEmail(testEmail)).thenReturn(reservations);
        BigDecimal result = discountService.calculateFrequentClientDiscount(testEmail);
        assertEquals(BigDecimal.ZERO, result);
    }

    @Test
    void whenRecentReservationsWithinWindow_thenReturnDiscount() {
        when(discountConfig.getDaysWindow()).thenReturn(7);
        when(discountConfig.getMinReservationsMultiplePackages()).thenReturn(3);
        when(discountConfig.getDiscountMultiplePackages()).thenReturn(new BigDecimal("0.15"));
        completedReservation.setReservationDate(LocalDateTime.now().minusDays(2));
        List<Reservation> reservations = Arrays.asList(completedReservation, completedReservation, completedReservation);
        when(reservationRepository.findByUserEmail(testEmail)).thenReturn(reservations);
        BigDecimal result = discountService.calculateMultiplePackagesDiscount(testEmail);
        assertEquals(new BigDecimal("0.15"), result);
    }

    @Test
    void whenReservationsOutsideWindow_thenReturnZero() {
        when(discountConfig.getDaysWindow()).thenReturn(7);
        when(discountConfig.getMinReservationsMultiplePackages()).thenReturn(3);
        Reservation oldReservation = new Reservation();
        oldReservation.setReservationState(ReservationState.COMPLETED);
        oldReservation.setReservationDate(LocalDateTime.now().minusDays(9));
        List<Reservation> reservations = Arrays.asList(oldReservation, oldReservation, oldReservation);
        when(reservationRepository.findByUserEmail(testEmail)).thenReturn(reservations);
        BigDecimal result = discountService.calculateMultiplePackagesDiscount(testEmail);
        assertEquals(BigDecimal.ZERO, result);
    }

    @Test
    void isCompletedReservation_ShouldEvaluateStatesCorrectly() {
        Reservation resPending = new Reservation();
        resPending.setReservationState(ReservationState.PENDING);
        Reservation resCanceled = new Reservation();
        resCanceled.setReservationState(ReservationState.CANCELED);
        Reservation resCompleted = new Reservation();
        resCompleted.setReservationState(ReservationState.COMPLETED);
        Reservation resConfirmed = new Reservation();
        resConfirmed.setReservationState(ReservationState.CONFIRMED);
        assertFalse(discountService.isCompletedReservation(resPending));
        assertFalse(discountService.isCompletedReservation(resCanceled));
        assertTrue(discountService.isCompletedReservation(resCompleted));
        assertTrue(discountService.isCompletedReservation(resConfirmed));
    }
}