package com.tingeso.backend.services;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.entities.User;
import com.tingeso.backend.repositories.ReservationRepository;
import com.tingeso.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;

    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Transactional
    public User update(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public Boolean deleteById(Long id) throws EmptyResultDataAccessException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        List<Reservation> reservations = reservationRepository.findByUserId(id);
        if (reservations.isEmpty()) {
            userRepository.deleteById(id);
            return true;
        }
        else {
            user.setActive(false);
            userRepository.save(user);
            return false;
        }
    }
}
