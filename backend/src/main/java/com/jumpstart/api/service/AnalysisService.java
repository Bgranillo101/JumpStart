package com.jumpstart.api.service;

import com.jumpstart.api.entity.AnalysisResult;
import com.jumpstart.api.repository.AnalysisResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final AnalysisResultRepository analysisResultRepository;
    private final ClaudeApiService claudeApiService;

    public AnalysisResult analyzeTeam(Long startupId) {
        // TODO: implement
        // 1. Fetch startup + all team members + their skills
        // 2. Build prompt for Claude API
        // 3. Parse Claude's JSON response
        // 4. Save RoleAssignments, RoleGaps, and skill heatmap
        // 5. Return the AnalysisResult
        return null;
    }

    public AnalysisResult getLatestResult(Long startupId) {
        List<AnalysisResult> results = analysisResultRepository.findByStartupId(startupId);
        if (results.isEmpty()) return null;
        return results.get(results.size() - 1);
    }
}
