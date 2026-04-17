package com.tingeso.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
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

    @Enumerated(EnumType.STRING)
    private ReservationState reservationState;

    private LocalDate selectedDate;
    private Integer passengersAmount;
    private List<String> preferences;
    private List<String> specialRequests;
}
