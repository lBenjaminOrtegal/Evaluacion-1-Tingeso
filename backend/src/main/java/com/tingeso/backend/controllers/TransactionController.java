package com.tingeso.backend.controllers;

import com.tingeso.backend.entities.Transaction;
import com.tingeso.backend.services.TransactionService;
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
