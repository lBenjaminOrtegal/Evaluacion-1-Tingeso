package com.tingeso.backend.controllers;

import com.tingeso.backend.entities.*;
import com.tingeso.backend.services.TourPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tour-packages")
@RequiredArgsConstructor
@CrossOrigin(origins = "https://localhost:5173")
public class TourPackageController {

    private final TourPackageService tourPackageService;

    @GetMapping
    public ResponseEntity<List<TourPackage>> findAll() {
        return ResponseEntity.ok(tourPackageService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourPackage> findById(@PathVariable Long id) {
        return ResponseEntity.ok(tourPackageService.findById(id));
    }

    @GetMapping("/filters")
    public ResponseEntity<List<TourPackage>> findCustomFilters(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String destiny,
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Season season,
            @RequestParam(required = false) TripType tripType,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) TourPackageState state) {
        TourPackageFilters tourPackageFilters = new TourPackageFilters(
                name,
                destiny,
                category,
                season,
                tripType,
                maxPrice,
                startDate,
                endDate,
                state
        );
        return ResponseEntity.ok(tourPackageService.findCustomFilters(tourPackageFilters));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<TourPackage> create(@RequestBody TourPackage tourPackage) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tourPackageService.createTourPackage(tourPackage));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public ResponseEntity<TourPackage> update(@RequestBody TourPackage tourPackage) {
        return ResponseEntity.ok(tourPackageService.update(tourPackage));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> delete(@PathVariable Long id) {
        tourPackageService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
