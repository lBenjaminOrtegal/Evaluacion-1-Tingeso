package com.tingeso.backend.repositories;

import com.tingeso.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @Query(value = "SELECT * FROM users WHERE users.email = :email", nativeQuery = true)
    User findByEmailNativeQuery(@Param("email") String email);
}
