package com.tingeso.backend.repositories;

import com.tingeso.backend.entities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourPackageRepository extends JpaRepository<TourPackage, Long> {

    List<TourPackage> findByRemainingSpotsGreaterThan(Integer remainingSpots);
    List<TourPackage> findByTourPackageState(TourPackageState tourPackageState);

    @Query("SELECT t FROM TourPackage t WHERE " +
            "(:#{#tourPackageFilters.name} IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :#{#tourPackageFilters.name}, '%'))) AND " +
            "(:#{#tourPackageFilters.destiny} IS NULL OR LOWER(t.destiny) LIKE LOWER(CONCAT('%', :#{#tourPackageFilters.destiny}, '%'))) AND " +
            "(:#{#tourPackageFilters.category} IS NULL OR t.category = :#{#tourPackageFilters.category}) AND " +
            "(:#{#tourPackageFilters.season} IS NULL OR t.season = :#{#tourPackageFilters.season}) AND " +
            "(:#{#tourPackageFilters.tripType} IS NULL OR t.tripType = :#{#tourPackageFilters.tripType}) AND " +
            "(:#{#tourPackageFilters.maxPrice} IS NULL OR t.price <= :#{#tourPackageFilters.maxPrice}) AND " +
            "(:#{#tourPackageFilters.startDate} IS NULL OR t.startDate >= :#{#tourPackageFilters.startDate}) AND " +
            "(:#{#tourPackageFilters.endDate} IS NULL OR t.endDate <= :#{#tourPackageFilters.endDate}) AND " +
            "(:#{#tourPackageFilters.minSpots} IS NULL OR t.remainingSpots >= :#{#tourPackageFilters.minSpots})")
    List<TourPackage> findCustomFilters(@Param("tourPackageFilters") TourPackageFilters tourPackageFilters);
}