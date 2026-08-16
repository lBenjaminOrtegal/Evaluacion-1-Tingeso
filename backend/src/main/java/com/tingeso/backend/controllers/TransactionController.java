package com.tingeso.backend.controllers;

import com.tingeso.backend.dto.TransactionDTO;
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
    public ResponseEntity<TransactionDTO> findByReservationId(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.findByReservationId(id));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping
    public ResponseEntity<TransactionDTO> create(@Valid @RequestBody TransactionDTO transactionDTO) {
        return ResponseEntity.ok(transactionService.create(transactionDTO));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/payment")
    public ResponseEntity<Boolean> successfulTransaction() {
        return ResponseEntity.ok(transactionService.successfulTransaction());
    }
}
