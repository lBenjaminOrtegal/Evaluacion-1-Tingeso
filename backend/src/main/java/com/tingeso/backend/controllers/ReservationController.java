package com.tingeso.backend.controllers;

import com.tingeso.backend.dto.DiscountDataDTO;
import com.tingeso.backend.dto.ReservationDTO;
import com.tingeso.backend.services.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping
    public ResponseEntity<List<ReservationDTO>> findAll() {
        return ResponseEntity.ok(reservationService.findAll());
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ReservationDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.findById(id));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/user-email/{userEmail}")
    public ResponseEntity<List<ReservationDTO>> findByUserEmail(@PathVariable String userEmail) {
        return ResponseEntity.ok(reservationService.findByUserEmail(userEmail));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/reports/date")
    public ResponseEntity<List<ReservationDTO>> findDateReports(@RequestParam LocalDateTime startDate, @RequestParam LocalDateTime endDate) {
        return ResponseEntity.ok(reservationService.findDateReports(startDate, endDate));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/reports/ranking")
    public ResponseEntity<List<List<ReservationDTO>>> findRanking(@RequestParam LocalDateTime startDate, @RequestParam LocalDateTime endDate, @RequestParam Integer order, @RequestParam String type) {
        return ResponseEntity.ok(reservationService.findRanking(startDate, endDate, order, type));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping
    public ResponseEntity<ReservationDTO> create(@Valid @RequestBody ReservationDTO reservationDTO) {
        return ResponseEntity.ok(reservationService.create(reservationDTO));
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PutMapping
    public ResponseEntity<ReservationDTO> update(@Valid @RequestBody ReservationDTO reservationDTO) {
        return ResponseEntity.ok(reservationService.update(reservationDTO));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reservationService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/calculate-price")
    public ResponseEntity<DiscountDataDTO> calculatePrice(@RequestBody ReservationDTO reservationDTO) {
        return ResponseEntity.ok(reservationService.calculatePrice(reservationDTO));
    }
}
