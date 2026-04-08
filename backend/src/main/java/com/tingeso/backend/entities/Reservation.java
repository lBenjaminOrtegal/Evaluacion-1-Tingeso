package com.tingeso.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String email;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long tourPackageId;

    @Enumerated(EnumType.STRING)
    private ReservationState state;

    private Integer passengersAmount;
    private String preferences;
    private List<String> specialRequests;
}
