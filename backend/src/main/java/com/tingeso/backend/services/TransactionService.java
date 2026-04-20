package com.tingeso.backend.services;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.entities.ReservationState;
import com.tingeso.backend.entities.Transaction;
import com.tingeso.backend.entities.TransactionState;
import com.tingeso.backend.repositories.ReservationRepository;
import com.tingeso.backend.repositories.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Transaction findById(Long id) {
        return transactionRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public Transaction findByReservationId(Long reservationId) {
        return transactionRepository.findByReservationId(reservationId);
    }

    @Transactional
    public Transaction create(Transaction transaction) {
        Reservation reservation = reservationRepository.findById(transaction.getReservationId()).orElse(null);
        if (reservation != null) {
            reservation.setReservationState(ReservationState.CONFIRMED);
            reservation.setPaymentDate(LocalDateTime.now());
            reservationRepository.save(reservation);
        }
        transaction.setDate(LocalDateTime.now());
        transaction.setState(TransactionState.SUCCESS);
        return transactionRepository.save(transaction);
    }

    public Boolean successfulTransaction() {
        return true;
    }
}
