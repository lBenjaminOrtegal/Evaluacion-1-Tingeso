package com.tingeso.backend.dto;

import com.tingeso.backend.entities.Reservation;
import com.tingeso.backend.entities.Role;
import com.tingeso.backend.entities.User;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class UserDTO {

    private String firstname;
    private String lastname;
    private String email;
    private String phoneNumber;
    private Set<Role> roles;
    private List<Reservation> reservations;

    public String fullName() {
        return firstname + " " + lastname;
    }

    public UserDTO(User user) {
        this.firstname = user.getFirstname();
        this.lastname = user.getLastname();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.roles = user.getRoles();
        this.reservations = user.getReservations();
    }
}
