package com.jumpstart.api.controller;

import com.jumpstart.api.entity.AnalysisResult;
import com.jumpstart.api.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/startups/{startupId}/analyze")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping
    public ResponseEntity<AnalysisResult> analyzeTeam(@PathVariable Long startupId) {
        return ResponseEntity.ok(analysisService.analyzeTeam(startupId));
    }

    @GetMapping("/results")
    public ResponseEntity<AnalysisResult> getLatestResults(@PathVariable Long startupId) {
        return ResponseEntity.ok(analysisService.getLatestResult(startupId));
    }
}
