package com.jumpstart.api.controller;

import com.jumpstart.api.entity.TeamMember;
import com.jumpstart.api.service.TeamMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/startups/{startupId}/members")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    @PostMapping
    public ResponseEntity<TeamMember> addMember(
            @PathVariable Long startupId,
            @RequestBody TeamMember member) {
        TeamMember created = teamMemberService.addMember(startupId, member);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<TeamMember>> getMembers(@PathVariable Long startupId) {
        return ResponseEntity.ok(teamMemberService.getMembersByStartup(startupId));
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long startupId,
            @PathVariable Long memberId) {
        teamMemberService.removeMember(memberId);
        return ResponseEntity.noContent().build();
    }
}
