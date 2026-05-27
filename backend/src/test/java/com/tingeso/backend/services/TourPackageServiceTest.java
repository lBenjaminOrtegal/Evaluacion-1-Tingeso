package com.tingeso.backend.services;

import com.tingeso.backend.entities.*;
import com.tingeso.backend.repositories.ReservationRepository;
import com.tingeso.backend.repositories.TourPackageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourPackageServiceTest {

    @Mock
    private TourPackageRepository tourPackageRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private TourPackageService tourPackageService;

    private TourPackage tourPackage;

    @BeforeEach
    void setUp() {
        tourPackage = new TourPackage();
        tourPackage.setId(1L);
        tourPackage.setPrice(BigDecimal.valueOf(100));
        tourPackage.setStartDate(LocalDate.now().plusDays(5));
        tourPackage.setEndDate(LocalDate.now().plusDays(10));
        tourPackage.setInitialSpots(10);
        tourPackage.setRemainingSpots(10);
        tourPackage.setTourPackageState(TourPackageState.AVAILABLE);
    }

    @Test
    void findById_ReturnsPackage() {
        when(tourPackageRepository.findById(1L)).thenReturn(Optional.of(tourPackage));
        assertNotNull(tourPackageService.findById(1L));
    }

    @Test
    void findAll_ReturnsList() {
        when(tourPackageRepository.findAll()).thenReturn(Collections.singletonList(tourPackage));
        assertFalse(tourPackageService.findAll().isEmpty());
    }

    @Test
    void findCustomFilters_ReturnsList() {
        TourPackageFilters filters = new TourPackageFilters("Paris", null, null, null, null, BigDecimal.valueOf(5000), LocalDate.now(), LocalDate.now().plusDays(7), null);
        when(tourPackageRepository.findCustomFilters(filters)).thenReturn(Collections.singletonList(tourPackage));
        List<TourPackage> result = tourPackageService.findCustomFilters(filters);
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(tourPackageRepository).findCustomFilters(filters);
    }

    @Test
    void create_ThrowsException_WhenPriceIsZeroOrNegative() {
        tourPackage.setPrice(BigDecimal.ZERO);
        assertThrows(IllegalStateException.class, () -> tourPackageService.createTourPackage(tourPackage));
    }

    @Test
    void create_ThrowsException_WhenDatesAreInvalid() {
        tourPackage.setEndDate(tourPackage.getStartDate().minusDays(1));
        assertThrows(IllegalStateException.class, () -> tourPackageService.createTourPackage(tourPackage));
    }

    @Test
    void create_ThrowsException_WhenSpotsEqualZero() {
        tourPackage.setInitialSpots(0);
        assertThrows(IllegalStateException.class, () -> tourPackageService.createTourPackage(tourPackage));
    }

    @Test
    void create_ThrowsException_WhenSpotsLessThanZero() {
        tourPackage.setInitialSpots(-1);
        assertThrows(IllegalStateException.class, () -> tourPackageService.createTourPackage(tourPackage));
    }

    @Test
    void create_Success() {
        when(tourPackageRepository.save(any(TourPackage.class))).thenReturn(tourPackage);
        TourPackage saved = tourPackageService.createTourPackage(tourPackage);
        assertNotNull(saved);
        verify(tourPackageRepository).save(tourPackage);
    }

    @Test
    void update_WithReservations_ValidSpots() {
        TourPackage updatedData = new TourPackage();
        updatedData.setId(1L);
        updatedData.setInitialSpots(15);
        tourPackage.setRemainingSpots(5);
        when(tourPackageRepository.findById(1L)).thenReturn(Optional.of(tourPackage));
        when(reservationRepository.findByTourPackageId(1L)).thenReturn(Collections.singletonList(new Reservation()));
        when(tourPackageRepository.save(any(TourPackage.class))).thenReturn(tourPackage);
        TourPackage result = tourPackageService.update(updatedData);
        assertEquals(15, result.getInitialSpots());
        assertEquals(10, result.getRemainingSpots());
    }

    @Test
    void update_WithReservations_InvalidSpots_ThrowsException() {
        TourPackage updatedData = new TourPackage();
        updatedData.setId(1L);
        updatedData.setInitialSpots(2);
        tourPackage.setInitialSpots(10);
        tourPackage.setRemainingSpots(5);
        when(tourPackageRepository.findById(1L)).thenReturn(Optional.of(tourPackage));
        when(reservationRepository.findByTourPackageId(1L)).thenReturn(Collections.singletonList(new Reservation()));
        assertThrows(IllegalStateException.class, () -> tourPackageService.update(updatedData));
    }

    @Test
    void update_WithReservations_WhenSpotsEqualOccupied_ThenStateIsSoldOut() {
        TourPackage updatedData = new TourPackage();
        updatedData.setId(1L);
        updatedData.setInitialSpots(5);
        tourPackage.setInitialSpots(10);
        tourPackage.setRemainingSpots(5);
        when(tourPackageRepository.findById(1L)).thenReturn(Optional.of(tourPackage));
        when(reservationRepository.findByTourPackageId(1L)).thenReturn(Collections.singletonList(new Reservation()));
        when(tourPackageRepository.save(any(TourPackage.class))).thenReturn(tourPackage);
        TourPackage result = tourPackageService.update(updatedData);
        assertEquals(0, result.getRemainingSpots());
        assertEquals(TourPackageState.SOLD_OUT, result.getTourPackageState());
        verify(tourPackageRepository).save(tourPackage);
    }

    @Test
    void update_NoReservations_Success() {
        when(tourPackageRepository.findById(1L)).thenReturn(Optional.of(tourPackage));
        when(reservationRepository.findByTourPackageId(1L)).thenReturn(new ArrayList<>());
        when(tourPackageRepository.save(any(TourPackage.class))).thenReturn(tourPackage);
        TourPackage result = tourPackageService.update(tourPackage);
        assertNotNull(result);
    }

    @Test
    void deleteById_NoReservations_DeletesFromDb() {
        when(tourPackageRepository.findById(1L)).thenReturn(Optional.of(tourPackage));
        when(reservationRepository.findByTourPackageId(1L)).thenReturn(new ArrayList<>());
        tourPackageService.deleteById(1L);
        verify(tourPackageRepository).delete(tourPackage);
    }

    @Test
    void deleteById_WithReservations_ChangesStateToNotAvailable() {
        when(tourPackageRepository.findById(1L)).thenReturn(Optional.of(tourPackage));
        when(reservationRepository.findByTourPackageId(1L)).thenReturn(Collections.singletonList(new Reservation()));
        tourPackageService.deleteById(1L);
        verify(tourPackageRepository, never()).delete(any());
        assertEquals(TourPackageState.NOT_AVAILABLE, tourPackage.getTourPackageState());
    }

    @Test
    void cancelStartedTourPackages_ChangesStateIfToday() {
        tourPackage.setStartDate(LocalDate.now());
        List<TourPackage> list = Collections.singletonList(tourPackage);
        when(tourPackageRepository.findAll()).thenReturn(list);
        tourPackageService.cancelStartedTourPackages();
        assertEquals(TourPackageState.NOT_AVAILABLE, tourPackage.getTourPackageState());
        verify(tourPackageRepository).saveAll(list);
    }

    @Test
    void cancelStartedTourPackages_NotChanges() {
        tourPackage.setStartDate(LocalDate.now().minusDays(1));
        List<TourPackage> list = Collections.singletonList(tourPackage);
        when(tourPackageRepository.findAll()).thenReturn(list);
        tourPackageService.cancelStartedTourPackages();
        verify(tourPackageRepository).saveAll(list);
    }
}