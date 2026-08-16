package com.tingeso.backend.dto;

import java.math.BigDecimal;

public record DiscountDTO(
        boolean combinableDiscounts,
        BigDecimal maxDiscountLimit,
        Integer minPassengers,
        BigDecimal discountPassengers,
        Integer minReservations,
        BigDecimal discountReservations,
        Integer daysWindow,
        Integer minReservationsMultiplePackages,
        BigDecimal discountMultiplePackages
) {}