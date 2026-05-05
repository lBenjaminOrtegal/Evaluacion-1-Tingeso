package com.tingeso.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountDataDTO {
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmountWithoutDiscounts;
    private BigDecimal passengersDiscount;
    private BigDecimal frequentClientDiscount;
    private BigDecimal multiplePackagesDiscount;
    private BigDecimal promotionDiscount;
    private Boolean maxDiscount;
}
