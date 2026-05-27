package com.tingeso.backend.configuration;

import com.tingeso.backend.entities.Discount;
import com.tingeso.backend.repositories.DiscountRepository;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class DiscountConfig {

    private final DiscountRepository discountRepository;
    private static final Long CONFIG_ID = 1L;

    public DiscountConfig(DiscountRepository discountRepository) {
        this.discountRepository = discountRepository;
    }

    private Discount getDiscountConfig() {
        return discountRepository.findById(CONFIG_ID)
                .orElseThrow(() -> new IllegalStateException("discount not found"));
    }

    public boolean isCombinableDiscounts() {
        return getDiscountConfig().isCombinableDiscounts();
    }

    public BigDecimal getMaxDiscountLimit() {
        return getDiscountConfig().getMaxDiscountLimit();
    }

    public Integer getMinPassengers() {
        return getDiscountConfig().getMinPassengers();
    }

    public BigDecimal getDiscountPassengers() {
        return getDiscountConfig().getDiscountPassengers();
    }

    public Integer getMinReservations() {
        return getDiscountConfig().getMinReservations();
    }

    public BigDecimal getDiscountReservations() {
        return getDiscountConfig().getDiscountReservations();
    }

    public Integer getDaysWindow() {
        return getDiscountConfig().getDaysWindow();
    }

    public Integer getMinReservationsMultiplePackages() {
        return getDiscountConfig().getMinReservationsMultiplePackages();
    }

    public BigDecimal getDiscountMultiplePackages() {
        return getDiscountConfig().getDiscountMultiplePackages();
    }
}