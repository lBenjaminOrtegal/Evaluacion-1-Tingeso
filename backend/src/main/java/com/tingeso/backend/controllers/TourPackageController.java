package com.tingeso.backend.controllers;

import com.tingeso.backend.entities.TourPackage;
import com.tingeso.backend.services.TourPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tour-packages")
@RequiredArgsConstructor
@CrossOrigin("*")
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

    @GetMapping("/category/{category}")
    public ResponseEntity<List<TourPackage>> findByCategory(@PathVariable String category) {
        return ResponseEntity.ok(tourPackageService.findByCategory(category));
    }

    @GetMapping("/destiny/{destiny}")
    public ResponseEntity<List<TourPackage>> findByDestiny(@PathVariable String destiny) {
        return ResponseEntity.ok(tourPackageService.findByDestiny(destiny));
    }

    @GetMapping("/season/{season}")
    public ResponseEntity<List<TourPackage>> findBySeason(@PathVariable String season) {
        return ResponseEntity.ok(tourPackageService.findBySeason(season));
    }

    @GetMapping("/spots/{spots}")
    public ResponseEntity<List<TourPackage>> findBySpots(@PathVariable Integer spots) {
        return ResponseEntity.ok(tourPackageService.findBySpots(spots));
    }

    @GetMapping("/type-of-trip/{typeOfTrip}")
    public ResponseEntity<List<TourPackage>> findByTypeOfTrip(@PathVariable String typeOfTrip) {
        return ResponseEntity.ok(tourPackageService.findByTypeOfTrip(typeOfTrip));
    }

    @GetMapping("/state/{state}")
    public ResponseEntity<List<TourPackage>> findByState(@PathVariable String state) {
        return ResponseEntity.ok(tourPackageService.findByTourPackageState(state));
    }

    @PostMapping
    public ResponseEntity<TourPackage> create(@RequestBody TourPackage tourPackage) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tourPackageService.createTourPackage(tourPackage));
    }

    @PutMapping
    public ResponseEntity<TourPackage> update(@RequestBody TourPackage tourPackage) {
        return ResponseEntity.ok(tourPackageService.update(tourPackage));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> delete(@PathVariable Long id) {
        return ResponseEntity.ok(tourPackageService.deleteById(id));
    }
}
