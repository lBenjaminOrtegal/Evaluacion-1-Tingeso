package com.tingeso.backend.repositories;

import com.tingeso.backend.entities.Discount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscountRepository extends JpaRepository<Discount, Long> {
}
