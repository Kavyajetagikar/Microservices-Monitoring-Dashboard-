package com.example.demo.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.demo.model.Order;
import com.example.demo.repository.OrderRepository;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(OrderRepository orderRepository) {
        return args -> {
            if (orderRepository.count() == 0) {
                orderRepository.saveAll(List.of(
                    new Order("John", 1500.0, "CONFIRMED"),
                    new Order("Smith", 2500.0, "PROCESSING"),
                    new Order("Blake", 900.0, "DELIVERED")
                ));
                System.out.println("Initialized MySQL database with default demo orders.");
            }
        };
    }
}
