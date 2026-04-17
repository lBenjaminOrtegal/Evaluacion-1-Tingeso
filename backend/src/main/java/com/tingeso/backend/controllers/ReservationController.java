package com.tingeso.backend.controllers;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.entities.ReservationState;
import com.tingeso.backend.services.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReservationController {

    private final ReservationService reservationService;

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping
    public ResponseEntity<List<Reservation>> findAll() {
        return ResponseEntity.ok(reservationService.findAll());
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Reservation> findById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.findById(id));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/user-email/{userEmail}")
    public ResponseEntity<List<Reservation>> findByUserEmail(@PathVariable String userEmail) {
        return ResponseEntity.ok(reservationService.findByUserEmail(userEmail));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/tour-package-id/{id}")
    public ResponseEntity<List<Reservation>> findByTourPackageId(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.findByTourPackageId(id));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/state/{reservationState}")
    public ResponseEntity<List<Reservation>> findByReservationState(@PathVariable ReservationState reservationState) {
        return ResponseEntity.ok(reservationService.findByReservationState(reservationState));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping
    public ResponseEntity<Reservation> create(@RequestBody Reservation reservation) {
        return ResponseEntity.ok(reservationService.save(reservation));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PutMapping
    public ResponseEntity<Reservation> update(@RequestBody Reservation reservation) {
        return ResponseEntity.ok(reservationService.update(reservation));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        reservationService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
