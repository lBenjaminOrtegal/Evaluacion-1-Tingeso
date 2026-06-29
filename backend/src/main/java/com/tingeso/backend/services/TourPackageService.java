package com.tingeso.backend.services;

import com.tingeso.backend.dto.TourPackageFiltersDTO;
import com.tingeso.backend.entities.*;
import com.tingeso.backend.enums.TourPackageState;
import com.tingeso.backend.exceptions.BusinessRuleException;
import com.tingeso.backend.exceptions.ResourceNotFoundException;
import com.tingeso.backend.repositories.ReservationRepository;
import com.tingeso.backend.repositories.TourPackageRepository;
import lombok.RequiredArgsConstructor;
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
    public List<TourPackage> findAll() {
        return tourPackageRepository.findAll();
    }

    @Transactional(readOnly = true)
    public TourPackage findById(Long id) {
        return tourPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour package with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public List<TourPackage> findCustomFilters(TourPackageFiltersDTO tourPackageFiltersDTO) {
        return tourPackageRepository.findCustomFilters(tourPackageFiltersDTO);
    }

    @Transactional
    public TourPackage createTourPackage(TourPackage tourPackage) {
        if (tourPackage.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Price must be greater than zero");
        }
        if (tourPackage.getEndDate().isBefore(tourPackage.getStartDate())) {
            throw new BusinessRuleException("Start date must be before end date");
        }
        if (tourPackage.getInitialSpots() <= 0) {
            throw new BusinessRuleException("Initial spots must be greater than zero");
        }
        tourPackage.calculateDuration();
        return tourPackageRepository.save(tourPackage);
    }

    @Transactional
    public TourPackage update(TourPackage tourPackage) {
        TourPackage existingPackage = tourPackageRepository.findById(tourPackage.getId())
                .orElseThrow(() -> new ResourceNotFoundException("TourPackage not found with id: " + tourPackage.getId()));
        List<Reservation> reservations = reservationRepository.findByTourPackageId(tourPackage.getId());
        existingPackage.setName(tourPackage.getName());
        existingPackage.setPrice(tourPackage.getPrice());
        existingPackage.setSeason(tourPackage.getSeason());
        existingPackage.setCategory(tourPackage.getCategory());
        existingPackage.setTripType(tourPackage.getTripType());
        existingPackage.setServices(tourPackage.getServices());
        existingPackage.setConditions(tourPackage.getConditions());
        existingPackage.setRestrictions(tourPackage.getRestrictions());
        int occupiedSpots = existingPackage.getInitialSpots() - existingPackage.getRemainingSpots();
        if (!reservations.isEmpty()) { // if had reservations
            if (tourPackage.getInitialSpots() < occupiedSpots) {
                throw new BusinessRuleException("New initial spots are less tan occupied spots.");
            } else {
                existingPackage.setInitialSpots(tourPackage.getInitialSpots());
                existingPackage.setRemainingSpots(tourPackage.getInitialSpots() - occupiedSpots);
            }
        } else {
            existingPackage.setStartDate(tourPackage.getStartDate());
            existingPackage.setEndDate(tourPackage.getEndDate());
            existingPackage.calculateDuration();
            existingPackage.setInitialSpots(tourPackage.getInitialSpots());
            existingPackage.setRemainingSpots(tourPackage.getInitialSpots());
        }
        if (existingPackage.getRemainingSpots() <= 0) {
            existingPackage.setTourPackageState(TourPackageState.SOLD_OUT);
        } else {
            existingPackage.setTourPackageState(tourPackage.getTourPackageState());
        }
        return tourPackageRepository.save(existingPackage);
    }

    @Transactional
    public void deleteById(Long id) {
        TourPackage tourPackage = tourPackageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TourPackage not found with id: " + id));
        List<Reservation> reservations = reservationRepository.findByTourPackageId(id);
        if (reservations.isEmpty()) {
            tourPackageRepository.delete(tourPackage);
        } else {
            tourPackage.setTourPackageState(TourPackageState.NOT_AVAILABLE);
            tourPackageRepository.save(tourPackage);
        }
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cancelStartedTourPackages() {
        List<TourPackage> tourPackageList = tourPackageRepository.findAll();
        for (TourPackage tourPackage : tourPackageList) {
            if (tourPackage.getStartDate().isAfter(LocalDate.now()) || tourPackage.getStartDate().isEqual(LocalDate.now())) {
                tourPackage.setTourPackageState(TourPackageState.NOT_AVAILABLE);
            }
        }
        tourPackageRepository.saveAll(tourPackageList);
    }
}
