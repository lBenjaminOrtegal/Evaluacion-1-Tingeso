package com.tingeso.backend.entities;

import com.tingeso.backend.enums.ReservationState;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private Long tourPackageId;

    private String tourPackageName;

    @Enumerated(EnumType.STRING)
    private ReservationState reservationState;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    private LocalDateTime reservationDate;
    private LocalDateTime paymentDate;
    private Integer passengersAmount;
    private List<String> preferences;
    private List<String> specialRequests;
}
