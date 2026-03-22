package com.jumpstart.api.controller;

import com.jumpstart.api.entity.Skill;
import com.jumpstart.api.entity.Startup;
import com.jumpstart.api.entity.User;
import com.jumpstart.api.repository.StartupRepository;
import com.jumpstart.api.service.IntegrationSkillService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IntegrationUserController {

    private final IntegrationSkillService skillService;
    private final StartupRepository startupRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUser(@PathVariable Long userId) {
        User user = skillService.getUserWithSkills(userId);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/{userId}")
    public ResponseEntity<User> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody UpdateProfileRequest request) {
        User updated = skillService.updateUserProfile(userId, request.getName(), request.getPreferredRole());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{userId}/startup")
    public ResponseEntity<?> getUserStartup(@PathVariable Long userId) {
        Optional<Startup> owned = startupRepository.findFirstByOwnerUserId(userId);
        if (owned.isPresent()) return ResponseEntity.ok(owned.get());
        Optional<Startup> member = startupRepository.findFirstByMembersUserId(userId);
        return member.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/{userId}/skills")
    public ResponseEntity<List<Skill>> addSkills(
            @PathVariable Long userId,
            @RequestBody List<Skill> skills) {
        List<Skill> saved = skillService.addSkills(userId, skills);
        return ResponseEntity.ok(saved);
    }

    @Data
    static class UpdateProfileRequest {
        private String name;
        private String preferredRole;
    }
}
