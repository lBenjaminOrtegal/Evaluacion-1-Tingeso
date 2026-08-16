package com.tingeso.backend.dto;

import com.tingeso.backend.enums.ReservationState;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ReservationDTO(
        Long id,

        @NotBlank(message = "User email cannot be null")
        String userEmail,

        @NotNull(message = "Tour package id cannot be null")
        Long tourPackageId,

        String tourPackageName,
        ReservationState reservationState,
        BigDecimal price,
        LocalDateTime reservationDate,
        LocalDateTime paymentDate,

        @NotNull(message = "Passengers amount cannot be null")
        @Positive(message = "Passengers amount must be greater than zero")
        Integer passengersAmount,

        List<String> preferences,
        List<String> specialRequests
) {}