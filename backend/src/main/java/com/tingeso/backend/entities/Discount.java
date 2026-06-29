package com.tingeso.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "discounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Discount {

    @Id
    private Long id = 1L;

    private boolean combinableDiscounts;
    private BigDecimal maxDiscountLimit;

    private Integer minPassengers;
    private BigDecimal discountPassengers;

    private Integer minReservations;
    private BigDecimal discountReservations;

    private Integer daysWindow;
    private Integer minReservationsMultiplePackages;
    private BigDecimal discountMultiplePackages;
}