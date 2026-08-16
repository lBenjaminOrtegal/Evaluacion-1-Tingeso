package com.tingeso.backend.dto;

import com.tingeso.backend.enums.PaymentMethod;
import com.tingeso.backend.enums.TransactionState;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionDTO(
        Long id,

        @NotNull(message = "Amount cannot be null")
        @Positive(message = "Price must be greater than zero")
        BigDecimal amount,

        @NotNull(message = "Reservation id cannot be null")
        Long reservationId,

        LocalDateTime date,
        PaymentMethod paymentMethod,
        TransactionState state
) {}