package com.example.demo.controller;




import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/payments")
public class PaymentController {

    @GetMapping("/health")
    public Map<String, String> paymentHealth() {
        return Map.of(
            "service", "Payment Service",
            "status", "UP"
        );
    }

    @GetMapping("/{orderId}")
    public Map<String, Object> getPayment(
            @PathVariable Long orderId) {

        return Map.of(
            "paymentId", 1001,
            "orderId", orderId,
            "paymentStatus", "SUCCESS",
            "message", "Demo payment processed successfully"
        );
    }
}