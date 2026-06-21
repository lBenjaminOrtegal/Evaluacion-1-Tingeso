package com.tingeso.backend.repositories;

import com.tingeso.backend.entities.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Transaction findByReservationId(Long id);
}
