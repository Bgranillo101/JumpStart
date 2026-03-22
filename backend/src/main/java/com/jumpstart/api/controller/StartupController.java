package com.jumpstart.api.controller;

import com.jumpstart.api.entity.Startup;
import com.jumpstart.api.service.StartupService;
import com.jumpstart.api.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/startups")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StartupController {

    private final StartupService startupService;

    @Value("${frontend.url}")
    private String frontendUrl;

    @PostMapping
    public ResponseEntity<Startup> createStartup(@RequestBody Startup startup) {
        Long ownerId = SecurityUtil.getCurrentUserId();
        Startup created = startupService.createStartup(startup, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Startup> getStartup(@PathVariable Long id) {
        return ResponseEntity.ok(startupService.getStartup(id));
    }

    @GetMapping
    public ResponseEntity<List<Startup>> getAllStartups() {
        return ResponseEntity.ok(startupService.getAllStartups());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Startup> updateStartup(@PathVariable Long id, @RequestBody Startup startup) {
        return ResponseEntity.ok(startupService.updateStartup(id, startup));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStartup(@PathVariable Long id) {
        startupService.deleteStartup(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<String> generateInviteLink(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        String link = startupService.generateInviteLink(id, userId, frontendUrl);
        return ResponseEntity.ok(link);
    }

    @PostMapping("/join/{code}")
    public ResponseEntity<Startup> joinByInviteCode(@PathVariable String code) {
        Long userId = SecurityUtil.getCurrentUserId();
        Startup startup = startupService.joinByInviteCode(code, userId);
        return ResponseEntity.ok(startup);
    }
}
