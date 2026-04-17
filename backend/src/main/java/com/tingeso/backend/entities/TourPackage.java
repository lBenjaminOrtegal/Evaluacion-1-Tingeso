package com.tingeso.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "tour_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String destiny;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate startDate;
    private LocalDate endDate;
    private List<LocalDate> availableDates;
    private String duration;
    private BigDecimal price;
    private List<String> services;
    private List<String> conditions;
    private List<String> restrictions;
    private Integer spots;

    @Enumerated(EnumType.STRING)
    private TripType tripType;

    @Enumerated(EnumType.STRING)
    private Season season;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Enumerated(EnumType.STRING)
    private TourPackageState tourPackageState;
}
