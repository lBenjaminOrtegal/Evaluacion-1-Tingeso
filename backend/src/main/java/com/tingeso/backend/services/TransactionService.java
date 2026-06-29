package com.tingeso.backend.services;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.enums.ReservationState;
import com.tingeso.backend.entities.Transaction;
import com.tingeso.backend.enums.TransactionState;
import com.tingeso.backend.exceptions.BusinessRuleException;
import com.tingeso.backend.exceptions.ResourceNotFoundException;
import com.tingeso.backend.repositories.ReservationRepository;
import com.tingeso.backend.repositories.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public Transaction findByReservationId(Long id) {
        return transactionRepository.findByReservationId(id);
    }

    @Transactional
    public Transaction create(Transaction transaction) {
        Reservation reservation = reservationRepository.findById(transaction.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + transaction.getReservationId()));
        if (reservation.getReservationState() == ReservationState.CANCELED) {
            throw new BusinessRuleException("Cannot create transaction because reservation is canceled.");
        }
        if (reservation.getPaymentDate() != null) {
            throw new BusinessRuleException("Cannot create transaction because payment is already set.");
        }
        if (transaction.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Cannot create transaction because amount is less or equal to 0.");
        }
        reservation.setReservationState(ReservationState.CONFIRMED);
        reservation.setPaymentDate(LocalDateTime.now());
        reservationRepository.save(reservation);
        transaction.setDate(LocalDateTime.now());
        transaction.setState(TransactionState.SUCCESS);
        return transactionRepository.save(transaction);
    }

    public Boolean successfulTransaction() {
        return true;
    }
}
