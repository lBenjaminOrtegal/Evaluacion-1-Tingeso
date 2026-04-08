package com.tingeso.backend.repositories;

import com.tingeso.backend.entities.TourPackage;
import com.tingeso.backend.entities.TourPackageState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourPackageRepository extends JpaRepository<TourPackage, Long> {

    List<TourPackage> findByName(String name);
    List<TourPackage> findByCategory(String category);
    List<TourPackage> findByDestiny(String destiny);
    List<TourPackage> findByTypeOfTrip(String typeOfTrip);
    List<TourPackage> findBySeason(String season);
    List<TourPackage> findBySpotsGreaterThan(Integer spots);
    List<TourPackage> findByTourPackageState(TourPackageState tourPackageState);
}
