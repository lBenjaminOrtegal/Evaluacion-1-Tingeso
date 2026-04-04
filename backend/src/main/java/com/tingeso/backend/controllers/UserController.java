package com.tingeso.backend.controllers;

import com.tingeso.backend.dto.UserDTO;
import com.tingeso.backend.entities.Role;
import com.tingeso.backend.entities.User;
import com.tingeso.backend.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userService.findAll();
        List<UserDTO> userDTOs = users.stream().map(UserDTO::new).toList();
        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO userDTO = new UserDTO(userService.findById(id));
        return ResponseEntity.ok(userDTO);
    }

    @PostMapping
    public ResponseEntity<UserDTO> save(@Valid @RequestBody User user) {
        user.setRoles(Set.of(Role.ROLE_CLIENT));
        UserDTO userDTO = new UserDTO(userService.save(user));
        return ResponseEntity.ok(userDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateWithId(@Valid @RequestBody User user, @PathVariable Long id) {
        User currentUser = userService.findById(id);
        if (currentUser == null) {
            return ResponseEntity.notFound().build();
        }
        UserDTO userDTO = new UserDTO(userService.update(id, user));
        return ResponseEntity.ok(userDTO);
    }

    @DeleteMapping("{id}")
    public ResponseEntity<UserDTO> deleteById(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
