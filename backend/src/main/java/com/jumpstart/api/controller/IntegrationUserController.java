package com.jumpstart.api.controller;

import com.jumpstart.api.entity.Skill;
import com.jumpstart.api.entity.User;
import com.jumpstart.api.service.IntegrationSkillService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IntegrationUserController {

    private final IntegrationSkillService skillService;

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
