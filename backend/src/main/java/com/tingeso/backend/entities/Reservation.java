package com.tingeso.backend.entities;

import com.tingeso.backend.enums.ReservationState;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "User email cannot be null")
    private String userEmail;

    @NotNull(message = "Tour package id cannot be null")
    private Long tourPackageId;

    private String tourPackageName;

    @Enumerated(EnumType.STRING)
    private ReservationState reservationState;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    private LocalDateTime reservationDate;
    private LocalDateTime paymentDate;

    @NotNull(message = "Passengers amount cannot be null")
    @Positive(message = "Passengers amount must be greater than zero")
    private Integer passengersAmount;

    @ElementCollection
    private List<String> preferences = new ArrayList<>();

    @ElementCollection
    private List<String> specialRequests = new ArrayList<>();
}
