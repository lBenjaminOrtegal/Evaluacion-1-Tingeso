package com.tingeso.backend.dto;

import com.tingeso.backend.enums.Category;
import com.tingeso.backend.enums.Season;
import com.tingeso.backend.enums.TourPackageState;
import com.tingeso.backend.enums.TripType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TourPackageDTO(
        Long id,

        @NotBlank(message = "Name cannot be null")
        String name,

        @NotBlank(message = "Destiny cannot be null")
        String destiny,

        String description,

        @NotNull(message = "Start date cannot be null")
        LocalDate startDate,

        @NotNull(message = "Start date cannot be null")
        LocalDate endDate,

        String duration,

        @NotNull(message = "Price cannot be null")
        @Positive(message = "Price must be greater than zero")
        BigDecimal price,

        List<String> services,
        List<String> conditions,
        List<String> restrictions,

        @NotNull(message = "Initial spots cannot be null")
        @Positive(message = "Initial spots must be greater than 0")
        Integer initialSpots,

        Integer remainingSpots,
        TripType tripType,
        Season season,
        Category category,
        TourPackageState tourPackageState
) {}