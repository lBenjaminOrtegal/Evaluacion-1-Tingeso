package com.tingeso.backend.entities;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TourPackageFilters(
        String name,
        String destiny,
        Category category,
        Season season,
        TripType tripType,
        BigDecimal maxPrice,
        LocalDate startDate,
        LocalDate endDate,
        TourPackageState state
) {}
