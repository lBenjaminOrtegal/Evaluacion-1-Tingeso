package com.tingeso.backend.controllers;

import com.tingeso.backend.entities.Transaction;
import com.tingeso.backend.services.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> findByReservationId(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.findByReservationId(id));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping
    public ResponseEntity<Transaction> create(@Valid @RequestBody Transaction transaction) {
        return ResponseEntity.ok(transactionService.create(transaction));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/payment")
    public ResponseEntity<Boolean> successfulTransaction() {
        return ResponseEntity.ok(transactionService.successfulTransaction());
    }
}
