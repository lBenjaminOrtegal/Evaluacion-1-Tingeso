package com.tingeso.backend.services;

import com.tingeso.backend.entities.Role;
import com.tingeso.backend.entities.User;
import com.tingeso.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setActive(true);
        user.setRoles(Set.of(Role.ROLE_CLIENT));
        return userRepository.save(user);
    }
}
