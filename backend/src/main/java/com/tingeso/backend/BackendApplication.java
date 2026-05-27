package com.tingeso.backend;

import com.tingeso.backend.entities.Discount;
import com.tingeso.backend.repositories.DiscountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.math.BigDecimal;

@SpringBootApplication
@EnableScheduling
@RequiredArgsConstructor
public class BackendApplication implements CommandLineRunner {

    private final DiscountRepository discountRepository;

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        if (!discountRepository.existsById(1L)) {
            Discount defaultDiscounts = new Discount(
                    1L,
                    true,
                    new BigDecimal("0.25"),
                    4,
                    new BigDecimal("0.05"),
                    3,
                    new BigDecimal("0.10"),
                    7,
                    3,
                    new BigDecimal("0.15")
            );

            discountRepository.save(defaultDiscounts);
            System.out.println("Discount created");
        } else {
            System.out.println("Discount already exists");
        }
    }
}