package com.tingeso.backend.controllers;

import com.tingeso.backend.dto.DiscountDTO;
import com.tingeso.backend.entities.Discount;
import com.tingeso.backend.services.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Discount> getDiscount() {
        return ResponseEntity.ok(discountService.findDiscount());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public ResponseEntity<DiscountDTO> update(@RequestBody DiscountDTO discountDTO) {
        return ResponseEntity.ok(discountService.update(discountDTO));
    }
}
