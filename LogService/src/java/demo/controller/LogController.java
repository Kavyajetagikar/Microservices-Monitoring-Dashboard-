package com.example.demo.controller;


import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/logs")
public class LogController {

    private final List<Map<String, String>> logs =
            new CopyOnWriteArrayList<>();

    public LogController() {
        logs.add(createLog("INFO", "Order Service",
                "Order service started"));
        logs.add(createLog("INFO", "Payment Service",
                "Payment service started"));
        logs.add(createLog("WARN", "Order Service",
                "Demo warning: order processing took longer"));
    }

    @GetMapping
    public List<Map<String, String>> getLogs(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String service) {

        return logs.stream()
                .filter(log -> level == null
                        || log.get("level").equalsIgnoreCase(level))
                .filter(log -> service == null
                        || log.get("service").equalsIgnoreCase(service))
                .toList();
    }

    @PostMapping
    public Map<String, String> addLog(
            @RequestBody Map<String, String> request) {

        Map<String, String> log = createLog(
                request.getOrDefault("level", "INFO"),
                request.getOrDefault("service", "Unknown"),
                request.getOrDefault("message", "No message"));

        logs.add(log);
        return log;
    }

    private Map<String, String> createLog(
            String level, String service, String message) {

        return Map.of(
                "timestamp", Instant.now().toString(),
                "level", level,
                "service", service,
                "message", message
        );
    }
}