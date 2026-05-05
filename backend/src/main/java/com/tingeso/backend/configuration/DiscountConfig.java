package com.tingeso.backend.configuration;

import java.math.BigDecimal;

public class DiscountConfig {

    // global discounts configuration
    public static final boolean COMBINABLE_DISCOUNTS = true;
    public static final BigDecimal MAX_DISCOUNT_LIMIT = new BigDecimal("0.25");

    // discounts configuration for passengers amount
    public static final Integer MIN_PASSENGERS = 4;
    public static final BigDecimal DISCOUNT_PASSENGERS = new BigDecimal("0.05");

    // discounts configuration for reservations amount
    public static final Integer MIN_RESERVATIONS = 3;
    public static final BigDecimal DISCOUNT_RESERVATIONS = new BigDecimal("0.10");

    // discounts configuration for multiple packages amount
    public static final Integer DAYS_WINDOW = 7;
    public static final Integer MIN_RESERVATIONS_MULTIPLE_PACKAGES = 3;
    public static final BigDecimal DISCOUNT_MULTIPLE_PACKAGES = new BigDecimal("0.15");
}
