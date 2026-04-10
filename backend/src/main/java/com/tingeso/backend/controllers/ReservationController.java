package com.tingeso.backend.controllers;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.entities.ReservationState;
import com.tingeso.backend.services.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ResponseEntity<List<Reservation>> findAll() {
        return ResponseEntity.ok(reservationService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> findById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.findById(id));
    }

    @GetMapping("/user-id/{id}")
    public ResponseEntity<List<Reservation>> findByUserId(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.findByUserId(id));
    }

    @GetMapping("/tour-package-id/{id}")
    public ResponseEntity<List<Reservation>> findByTourPackageId(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.findByTourPackageId(id));
    }

    @GetMapping("/state/{state}")
    public ResponseEntity<List<Reservation>> findByState(@PathVariable ReservationState state) {
        return ResponseEntity.ok(reservationService.findByState(state));
    }

    @PostMapping
    public ResponseEntity<Reservation> create(@RequestBody Reservation reservation) {
        return ResponseEntity.ok(reservationService.save(reservation));
    }

    @PutMapping
    public ResponseEntity<Reservation> update(@RequestBody Reservation reservation) {
        return ResponseEntity.ok(reservationService.update(reservation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        reservationService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
