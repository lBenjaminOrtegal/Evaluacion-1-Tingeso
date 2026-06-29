package com.tingeso.backend.entities;

import com.tingeso.backend.enums.Category;
import com.tingeso.backend.enums.Season;
import com.tingeso.backend.enums.TourPackageState;
import com.tingeso.backend.enums.TripType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tour_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TourPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be null")
    private String name;

    @NotBlank(message = "Destiny cannot be null")
    private String destiny;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Start date cannot be null")
    private LocalDate startDate;

    @NotNull(message = "Start date cannot be null")
    private LocalDate endDate;

    private String duration;

    @NotNull(message = "Price cannot be null")
    @Positive(message = "Price must be greater than zero")
    private BigDecimal price;

    @ElementCollection
    private List<String> services = new ArrayList<>();

    @ElementCollection
    private List<String> conditions = new ArrayList<>();

    @ElementCollection
    private List<String> restrictions = new ArrayList<>();

    @NotNull(message = "Initial spots cannot be null")
    @Positive(message = "Initial spots must be greater than 0")
    private Integer initialSpots;

    private Integer remainingSpots;

    @Enumerated(EnumType.STRING)
    private TripType tripType;

    @Enumerated(EnumType.STRING)
    private Season season;

    @Enumerated(EnumType.STRING)
    private Category category;

    @Enumerated(EnumType.STRING)
    private TourPackageState tourPackageState;

    public void calculateDuration() {
        if (this.startDate != null && this.endDate != null) {
            long integerDuration = ChronoUnit.DAYS.between(this.startDate, this.endDate);
            if (services != null && services.stream()
                    .anyMatch(s -> s.equalsIgnoreCase("Alojamiento"))) {
                this.duration = integerDuration + " días, " + (integerDuration - 1) + " noches";
            }
            else {
                this.duration = integerDuration + " días";
            }
        }
    }
}
