package com.tingeso.backend.services;

import com.tingeso.backend.dto.TourPackageDTO;
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
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TourPackageService {

    private final TourPackageRepository tourPackageRepository;
    private final ReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public List<TourPackageDTO> findAll() {
        return tourPackageRepository.findAll()
                .stream()
                .map(this::tourPackageToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public TourPackageDTO findById(Long id) {
        Optional<TourPackage> tourPackage = tourPackageRepository.findById(id);
        if (tourPackage.isPresent()) {
            return tourPackageToDTO(tourPackage.get());
        } else throw new ResourceNotFoundException("Tour package with id " + id + " not found");
    }

    @Transactional(readOnly = true)
    public List<TourPackageDTO> findCustomFilters(TourPackageFiltersDTO tourPackageFiltersDTO) {
        return tourPackageRepository.findCustomFilters(tourPackageFiltersDTO)
                .stream()
                .map(this::tourPackageToDTO)
                .toList();
    }

    @Transactional
    public TourPackageDTO createTourPackage(TourPackageDTO tourPackageDTO) {
        if (tourPackageDTO.price().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Price must be greater than zero");
        }
        if (tourPackageDTO.endDate().isBefore(tourPackageDTO.startDate())) {
            throw new BusinessRuleException("Start date must be before end date");
        }
        if (tourPackageDTO.initialSpots() <= 0) {
            throw new BusinessRuleException("Initial spots must be greater than zero");
        }
        TourPackage tourPackage = new TourPackage();
        tourPackage.setName(tourPackageDTO.name());
        tourPackage.setDestiny(tourPackageDTO.destiny());
        tourPackage.setDescription(tourPackageDTO.description());
        tourPackage.setStartDate(tourPackageDTO.startDate());
        tourPackage.setEndDate(tourPackageDTO.endDate());
        tourPackage.calculateDuration();
        tourPackage.setPrice(tourPackageDTO.price());
        tourPackage.setServices(tourPackageDTO.services());
        tourPackage.setConditions(tourPackageDTO.conditions());
        tourPackage.setRestrictions(tourPackageDTO.restrictions());
        tourPackage.setInitialSpots(tourPackageDTO.initialSpots());
        tourPackage.setRemainingSpots(tourPackageDTO.remainingSpots());
        tourPackage.setTripType(tourPackageDTO.tripType());
        tourPackage.setSeason(tourPackageDTO.season());
        tourPackage.setCategory(tourPackageDTO.category());
        tourPackage.setTourPackageState(tourPackageDTO.tourPackageState());
        return tourPackageToDTO(tourPackageRepository.save(tourPackage));
    }

    @Transactional
    public TourPackageDTO update(TourPackageDTO tourPackageDTO) {
        TourPackage existingPackage = tourPackageRepository.findById(tourPackageDTO.id())
                .orElseThrow(() -> new ResourceNotFoundException("TourPackage not found with id: " + tourPackageDTO.id()));
        List<Reservation> reservations = reservationRepository.findByTourPackageId(tourPackageDTO.id());
        existingPackage.setName(tourPackageDTO.name());
        existingPackage.setPrice(tourPackageDTO.price());
        existingPackage.setSeason(tourPackageDTO.season());
        existingPackage.setCategory(tourPackageDTO.category());
        existingPackage.setTripType(tourPackageDTO.tripType());
        existingPackage.setServices(tourPackageDTO.services());
        existingPackage.setConditions(tourPackageDTO.conditions());
        existingPackage.setRestrictions(tourPackageDTO.restrictions());
        int occupiedSpots = existingPackage.getInitialSpots() - existingPackage.getRemainingSpots();
        if (!reservations.isEmpty()) { // if had reservations
            if (tourPackageDTO.initialSpots() < occupiedSpots) {
                throw new BusinessRuleException("New initial spots are less tan occupied spots.");
            } else {
                existingPackage.setInitialSpots(tourPackageDTO.initialSpots());
                existingPackage.setRemainingSpots(tourPackageDTO.initialSpots() - occupiedSpots);
            }
        } else {
            existingPackage.setStartDate(tourPackageDTO.startDate());
            existingPackage.setEndDate(tourPackageDTO.endDate());
            existingPackage.calculateDuration();
            existingPackage.setInitialSpots(tourPackageDTO.initialSpots());
            existingPackage.setRemainingSpots(tourPackageDTO.initialSpots());
        }
        if (existingPackage.getRemainingSpots() <= 0) {
            existingPackage.setTourPackageState(TourPackageState.SOLD_OUT);
        } else {
            existingPackage.setTourPackageState(tourPackageDTO.tourPackageState());
        }
        return tourPackageToDTO(tourPackageRepository.save(existingPackage));
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

    public TourPackageDTO tourPackageToDTO(TourPackage tourPackage) {
        return new TourPackageDTO(
                tourPackage.getId(),
                tourPackage.getName(),
                tourPackage.getDestiny(),
                tourPackage.getDescription(),
                tourPackage.getStartDate(),
                tourPackage.getEndDate(),
                tourPackage.getDuration(),
                tourPackage.getPrice(),
                tourPackage.getServices(),
                tourPackage.getConditions(),
                tourPackage.getRestrictions(),
                tourPackage.getInitialSpots(),
                tourPackage.getRemainingSpots(),
                tourPackage.getTripType(),
                tourPackage.getSeason(),
                tourPackage.getCategory(),
                tourPackage.getTourPackageState()
        );
    }
}
