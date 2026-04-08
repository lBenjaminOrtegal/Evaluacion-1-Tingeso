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
    private String typeOfTrip;
    private String season;
    private String category;

    // tourPackageState:
    //    AVAILABLE,
    //    SOLD_OUT,
    //    NOT_AVAILABLE,
    //    CANCELED
    @Enumerated(EnumType.STRING)
    private TourPackageState tourPackageState;
}
