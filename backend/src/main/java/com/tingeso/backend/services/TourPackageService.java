package com.tingeso.backend.services;

import com.tingeso.backend.entities.*;
import com.tingeso.backend.repositories.ReservationRepository;
import com.tingeso.backend.repositories.TourPackageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    public List<TourPackage> findCustomFilters(TourPackageFilters tourPackageFilters) {
        return tourPackageRepository.findCustomFilters(tourPackageFilters);
    }

    @Transactional
    public TourPackage createTourPackage(TourPackage tourPackage) {
        if (tourPackage.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Price must be greater than zero");
        }
        if (tourPackage.getEndDate().isBefore(tourPackage.getStartDate())) {
            throw new IllegalStateException("Start date must be before end date");
        }
        if (tourPackage.getInitialSpots() <= 0) {
            if (tourPackage.getTourPackageState() == TourPackageState.AVAILABLE) {
                throw new IllegalStateException("Initial spots must be greater than zero");
            }
        }
        tourPackage.calculateDuration();
        return tourPackageRepository.save(tourPackage);
    }

    @Transactional
    public TourPackage update(TourPackage tourPackage) {
        TourPackage existingPackage = tourPackageRepository.findById(tourPackage.getId())
                .orElseThrow(() -> new EntityNotFoundException("TourPackage not found with id: " + tourPackage.getId()));
        List<Reservation> reservations = reservationRepository.findByTourPackageId(tourPackage.getId());
        existingPackage.setName(tourPackage.getName());
        existingPackage.setPrice(tourPackage.getPrice());
        existingPackage.setSeason(tourPackage.getSeason());
        existingPackage.setCategory(tourPackage.getCategory());
        existingPackage.setTripType(tourPackage.getTripType());
        existingPackage.setServices(tourPackage.getServices());
        existingPackage.setConditions(tourPackage.getConditions());
        existingPackage.setRestrictions(tourPackage.getRestrictions());
        if (!reservations.isEmpty()) { // if had reservations
            int occupiedSpots = existingPackage.getInitialSpots() - existingPackage.getRemainingSpots();
            if (tourPackage.getInitialSpots() >= occupiedSpots) {
                existingPackage.setInitialSpots(tourPackage.getInitialSpots());
                existingPackage.setRemainingSpots(tourPackage.getInitialSpots() - occupiedSpots);
                if (existingPackage.getRemainingSpots() <= 0) {
                    existingPackage.setTourPackageState(TourPackageState.SOLD_OUT);
                } else {
                    existingPackage.setTourPackageState(TourPackageState.AVAILABLE);
                }
            }
            else {
                throw new IllegalStateException("Cannot modify because reservations have already been set.");
            }
        } else {
            existingPackage.setStartDate(tourPackage.getStartDate());
            existingPackage.setEndDate(tourPackage.getEndDate());
            existingPackage.calculateDuration();
            existingPackage.setInitialSpots(tourPackage.getInitialSpots());
            existingPackage.setRemainingSpots(existingPackage.getRemainingSpots());
            existingPackage.setTourPackageState(tourPackage.getTourPackageState());
        }
        return tourPackageRepository.save(existingPackage);
    }

    @Transactional
    public void deleteById(Long id) throws EmptyResultDataAccessException {
        TourPackage tourPackage = tourPackageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TourPackage not found with id: " + id));
        List<Reservation> reservations = reservationRepository.findByTourPackageId(id);
        if (reservations.isEmpty()) {
            tourPackageRepository.delete(tourPackage);
        }
        tourPackage.setTourPackageState(TourPackageState.NOT_AVAILABLE);
        tourPackageRepository.save(tourPackage);
    }

    @Scheduled(fixedRate = 3600000 * 24)
    @Transactional
    public void cancelStartedTourPackages() {
        List<TourPackage> tourPackageList = tourPackageRepository.findAll();
        for (TourPackage tourPackage : tourPackageList) {
            if (LocalDate.now().isEqual(tourPackage.getStartDate())) {
                tourPackage.setTourPackageState(TourPackageState.NOT_AVAILABLE);
            }
        }
        tourPackageRepository.saveAll(tourPackageList);
    }
}
