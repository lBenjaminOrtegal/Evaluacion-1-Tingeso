package com.tingeso.backend.repositories;

import com.tingeso.backend.entities.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    Optional<Promotion> findByTourPackageId(Long tourPackageId);
}
