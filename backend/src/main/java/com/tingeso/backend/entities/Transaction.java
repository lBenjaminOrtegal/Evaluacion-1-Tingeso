package com.tingeso.backend.entities;

import com.tingeso.backend.enums.PaymentMethod;
import com.tingeso.backend.enums.TransactionState;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Amount cannot be null")
    @Positive(message = "Price must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Reservation id cannot be null")
    private Long reservationId;

    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private TransactionState state;
}
