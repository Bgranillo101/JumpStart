package com.jumpstart.api.controller;

import com.jumpstart.api.dto.MemberSkillHeatmapResponse;
import com.jumpstart.api.dto.TeamSkillHeatmapResponse;
import com.jumpstart.api.service.SkillHeatmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/startups/{startupId}")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SkillHeatmapController {

    private final SkillHeatmapService skillHeatmapService;

    @GetMapping("/members/{memberId}/skill-heatmap")
    public ResponseEntity<MemberSkillHeatmapResponse> getMemberHeatmap(
            @PathVariable Long startupId,
            @PathVariable Long memberId) {
        return ResponseEntity.ok(skillHeatmapService.getMemberHeatmap(startupId, memberId));
    }

    @GetMapping("/skill-heatmap")
    public ResponseEntity<TeamSkillHeatmapResponse> getTeamHeatmap(
            @PathVariable Long startupId) {
        return ResponseEntity.ok(skillHeatmapService.getTeamHeatmap(startupId));
    }
}
