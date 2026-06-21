package com.tingeso.backend.services;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.enums.ReservationState;
import com.tingeso.backend.entities.Transaction;
import com.tingeso.backend.enums.TransactionState;
import com.tingeso.backend.repositories.ReservationRepository;
import com.tingeso.backend.repositories.TransactionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private TransactionService transactionService;

    private Transaction validTransaction;
    private Reservation validReservation;

    @BeforeEach
    void setUp() {
        validReservation = new Reservation();
        validReservation.setId(1L);
        validReservation.setReservationState(ReservationState.PENDING);

        validTransaction = new Transaction();
        validTransaction.setReservationId(1L);
        validTransaction.setAmount(new BigDecimal("100.00"));
    }

    @Test
    void createTransaction_Success() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(validReservation));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(validTransaction);
        Transaction result = transactionService.create(validTransaction);
        assertNotNull(result);
        assertEquals(TransactionState.SUCCESS, result.getState());
        assertEquals(ReservationState.CONFIRMED, validReservation.getReservationState());
        assertNotNull(validReservation.getPaymentDate());
        verify(reservationRepository).save(validReservation);
        verify(transactionRepository).save(validTransaction);
    }

    @Test
    void createTransaction_ThrowsEntityNotFound() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> {
            transactionService.create(validTransaction);
        });
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void createTransaction_ThrowsIllegalState_WhenReservationCanceled() {
        validReservation.setReservationState(ReservationState.CANCELED);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(validReservation));
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            transactionService.create(validTransaction);
        });
        assertTrue(exception.getMessage().contains("reservation is canceled"));
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void createTransaction_ThrowsIllegalStateException_WhenReservationAlreadyPaid() {
        validReservation.setPaymentDate(LocalDateTime.now());
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(validReservation));
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            transactionService.create(validTransaction);
        });
        assertTrue(exception.getMessage().contains("Cannot create transaction because payment is already set."));
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void createTransaction_ThrowsIllegalState_WhenAmountIsZeroOrLess() {
        validTransaction.setAmount(BigDecimal.ZERO);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(validReservation));
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            transactionService.create(validTransaction);
        });
        assertTrue(exception.getMessage().contains("amount is less or equal to 0"));
    }

    @Test
    void createTransaction_ThrowsIllegalState_WhenAmountIsNegative() {
        validTransaction.setAmount(new BigDecimal("-10.0"));
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(validReservation));
        assertThrows(IllegalStateException.class, () ->                                                                             {
            transactionService.create(validTransaction);
        });
    }

    @Test
    void successfulTransaction_ReturnsTrue() {
        assertTrue(transactionService.successfulTransaction());
    }
}