package com.tingeso.backend.controllers;

import com.tingeso.backend.entities.Category;
import com.tingeso.backend.entities.Season;
import com.tingeso.backend.entities.TourPackage;
import com.tingeso.backend.entities.TripType;
import com.tingeso.backend.services.TourPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tour-packages")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
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

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/category/{category}")
    public ResponseEntity<List<TourPackage>> findByCategory(@PathVariable Category category) {
        return ResponseEntity.ok(tourPackageService.findByCategory(category));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/destiny/{destiny}")
    public ResponseEntity<List<TourPackage>> findByDestiny(@PathVariable String destiny) {
        return ResponseEntity.ok(tourPackageService.findByDestiny(destiny));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/season/{season}")
    public ResponseEntity<List<TourPackage>> findBySeason(@PathVariable Season season) {
        return ResponseEntity.ok(tourPackageService.findBySeason(season));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/spots/{remainingSpots}")
    public ResponseEntity<List<TourPackage>> findByRemainingSpots(@PathVariable Integer remainingSpots) {
        return ResponseEntity.ok(tourPackageService.findByRemainingSpots(remainingSpots));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/type-of-trip/{tripType}")
    public ResponseEntity<List<TourPackage>> findByTypeOfTrip(@PathVariable TripType tripType) {
        return ResponseEntity.ok(tourPackageService.findByTripType(tripType));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/state/{state}")
    public ResponseEntity<List<TourPackage>> findByState(@PathVariable String state) {
        return ResponseEntity.ok(tourPackageService.findByTourPackageState(state));
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
        return ResponseEntity.ok(tourPackageService.deleteById(id));
    }
}
