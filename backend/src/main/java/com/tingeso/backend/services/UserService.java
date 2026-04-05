package com.tingeso.backend.services;

import com.tingeso.backend.entities.User;
import com.tingeso.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Transactional
    public User update(Long id, User user) {
        User currentUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        currentUser.setFirstname(user.getFirstname());
        currentUser.setLastname(user.getLastname());
        currentUser.setEmail(user.getEmail());
        currentUser.setPassword(user.getPassword());
        currentUser.setPhoneNumber(user.getPhoneNumber());
        return userRepository.save(currentUser);
    }

    @Transactional
    public void deleteById(Long id) throws EmptyResultDataAccessException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        if (user.getReservations().isEmpty()) {
            userRepository.deleteById(id);
        }
        else {
            user.setActive(false);
        }
    }
}
