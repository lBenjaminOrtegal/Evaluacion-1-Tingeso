package com.tingeso.backend.repositories;

import com.tingeso.backend.entities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourPackageRepository extends JpaRepository<TourPackage, Long> {

    List<TourPackage> findByName(String name);
    List<TourPackage> findByCategory(Category category);
    List<TourPackage> findByDestiny(String destiny);
    List<TourPackage> findByTripType(TripType tripType);
    List<TourPackage> findBySeason(Season season);
    List<TourPackage> findBySpotsGreaterThan(Integer spots);
    List<TourPackage> findByTourPackageState(TourPackageState tourPackageState);
}
