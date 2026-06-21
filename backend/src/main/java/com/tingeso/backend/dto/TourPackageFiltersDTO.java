package com.tingeso.backend.dto;

import com.tingeso.backend.enums.Category;
import com.tingeso.backend.enums.Season;
import com.tingeso.backend.enums.TourPackageState;
import com.tingeso.backend.enums.TripType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TourPackageFiltersDTO (
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
