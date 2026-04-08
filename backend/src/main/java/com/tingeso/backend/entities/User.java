package com.tingeso.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "firstname field is required")
    private String firstname;

    @NotBlank(message = "lastname field is required")
    private String lastname;

    @NotBlank(message = "email field is required")
    @Email(message = "valid email is required")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "password field is required")
    @Size(min = 8, message = "password must have between 8 and 20 characters")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$",
            message = "password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
    private String password;

    @NotBlank(message = "phone number field is required")
    @Column(unique = true)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private Role role;

    private Boolean active;
}
