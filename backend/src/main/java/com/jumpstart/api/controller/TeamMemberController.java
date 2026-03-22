package com.jumpstart.api.controller;

import com.jumpstart.api.entity.User;
import com.jumpstart.api.service.TeamMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/startups/{startupId}/members")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    @PostMapping
    public ResponseEntity<Void> addMember(
            @PathVariable Long startupId,
            @RequestBody Map<String, Long> body) {
        teamMemberService.addMember(startupId, body.get("userId"));
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<User>> getMembers(@PathVariable Long startupId) {
        return ResponseEntity.ok(teamMemberService.getMembersByStartup(startupId));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long startupId,
            @PathVariable Long userId) {
        teamMemberService.removeMember(startupId, userId);
        return ResponseEntity.noContent().build();
    }
}
