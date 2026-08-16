package com.tingeso.backend.services;

import com.tingeso.backend.dto.TransactionDTO;
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
    public TransactionDTO findByReservationId(Long id) {
        return transactionToDTO(transactionRepository.findByReservationId(id));
    }

    @Transactional
    public TransactionDTO create(TransactionDTO transactionDTO) {
        Reservation reservation = reservationRepository.findById(transactionDTO.reservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + transactionDTO.reservationId()));
        if (reservation.getReservationState() == ReservationState.CANCELED) {
            throw new BusinessRuleException("Cannot create transaction because reservation is canceled.");
        }
        if (reservation.getPaymentDate() != null) {
            throw new BusinessRuleException("Cannot create transaction because payment is already set.");
        }
        if (transactionDTO.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Cannot create transaction because amount is less or equal to 0.");
        }
        reservation.setReservationState(ReservationState.CONFIRMED);
        reservation.setPaymentDate(LocalDateTime.now());
        reservationRepository.save(reservation);
        Transaction transaction = new Transaction();
        transaction.setAmount(transactionDTO.amount());
        transaction.setReservationId(transactionDTO.reservationId());
        transaction.setDate(LocalDateTime.now());
        transaction.setPaymentMethod(transactionDTO.paymentMethod());
        transaction.setState(TransactionState.SUCCESS);
        return transactionToDTO(transactionRepository.save(transaction));
    }

    public Boolean successfulTransaction() {
        return true;
    }

    public TransactionDTO transactionToDTO(Transaction transaction) {
        return new TransactionDTO(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getReservationId(),
                transaction.getDate(),
                transaction.getPaymentMethod(),
                transaction.getState()
        );
    }
}
