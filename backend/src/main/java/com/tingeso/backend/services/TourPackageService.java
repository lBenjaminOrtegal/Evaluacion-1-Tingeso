package com.tingeso.backend.services;

import com.tingeso.backend.entities.*;
import com.tingeso.backend.repositories.ReservationRepository;
import com.tingeso.backend.repositories.TourPackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TourPackageService {

    private final TourPackageRepository tourPackageRepository;
    private final ReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public TourPackage findById(Long id) {
        return tourPackageRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<TourPackage> findAll() {
        return tourPackageRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<TourPackage> findByCategory(Category category) {
        return tourPackageRepository.findByCategory(category);
    }

    @Transactional(readOnly = true)
    public List<TourPackage> findByDestiny(String destiny) {
        return tourPackageRepository.findByDestiny(destiny);
    }

    @Transactional(readOnly = true)
    public List<TourPackage> findByName(String name) {
        return tourPackageRepository.findByName(name);
    }

    @Transactional(readOnly = true)
    public List<TourPackage> findBySeason(Season season) {
        return tourPackageRepository.findBySeason(season);
    }

    @Transactional(readOnly = true)
    public List<TourPackage> findBySpots(Integer spots) {
        return tourPackageRepository.findBySpotsGreaterThan(spots);
    }

    @Transactional(readOnly = true)
    public List<TourPackage> findByTripType(TripType tripType) {
        return tourPackageRepository.findByTripType(tripType);
    }

    @Transactional(readOnly = true)
    public List<TourPackage> findByTourPackageState(String state) {
        return tourPackageRepository.findByTourPackageState(TourPackageState.valueOf(state));
    }

    @Transactional
    public TourPackage createTourPackage(TourPackage tourPackage) {
        return tourPackageRepository.save(tourPackage);
    }

    @Transactional
    public TourPackage update(TourPackage tourPackage) throws EmptyResultDataAccessException {
        TourPackage tourPackageSaved = tourPackageRepository.findById(tourPackage.getId())
                .orElseThrow(() -> new RuntimeException("TourPackage not found with id: " + tourPackage.getId()));
        List<Reservation> reservations = reservationRepository.findByTourPackageId(tourPackage.getId());
        if (reservations.isEmpty()) {
            return tourPackageRepository.save(tourPackage);
        }
        return tourPackageSaved;
    }

    @Transactional
    public Boolean deleteById(Long id) throws EmptyResultDataAccessException {
        TourPackage tourPackage = tourPackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TourPackage not found with id: " + id));
        List<Reservation> reservations = reservationRepository.findByTourPackageId(id);
        if (reservations.isEmpty()) {
            tourPackageRepository.delete(tourPackage);
            return true;
        }
        tourPackage.setTourPackageState(TourPackageState.NOT_AVAILABLE);
        tourPackageRepository.save(tourPackage);
        return false;
    }
}
