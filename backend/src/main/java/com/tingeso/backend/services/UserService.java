package com.tingeso.backend.services;

import com.tingeso.backend.entities.User;

import java.util.List;

public interface UserService {

    List<User> findAll();
    User save(User user);
    User update(Long id, User user);
    void deleteById(Long id);
    User findById(Long id);
}
