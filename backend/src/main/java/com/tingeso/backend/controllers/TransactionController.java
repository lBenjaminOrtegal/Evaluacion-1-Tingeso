package com.tingeso.backend.controllers;

import com.tingeso.backend.entities.Transaction;
import com.tingeso.backend.services.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "https://localhost:5173")
public class TransactionController {

    private final TransactionService transactionService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Transaction>> findAll() {
        return ResponseEntity.ok(transactionService.findAll());
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> findById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.findById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/reservation/{id}")
    public ResponseEntity<Transaction> findByReservationId(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.findByReservationId(id));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping
    public ResponseEntity<Transaction> create(@RequestBody Transaction transaction) {
        return ResponseEntity.ok(transactionService.create(transaction));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/payment")
    public ResponseEntity<Boolean> successfulTransaction() {
        return ResponseEntity.ok(transactionService.successfulTransaction());
    }
}
