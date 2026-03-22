package com.jumpstart.api.controller;

import com.jumpstart.api.entity.TechStackRecommendation;
import com.jumpstart.api.service.TechStackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/startups/{startupId}/tech-stack")
@RequiredArgsConstructor
public class TechStackController {

    private final TechStackService techStackService;

    @PostMapping
    public ResponseEntity<List<TechStackRecommendation>> generate(@PathVariable Long startupId) {
        return ResponseEntity.ok(techStackService.recommendTechStack(startupId));
    }

    @GetMapping
    public ResponseEntity<List<TechStackRecommendation>> get(@PathVariable Long startupId) {
        return ResponseEntity.ok(techStackService.getTechStack(startupId));
    }
}
