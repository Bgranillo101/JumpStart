package com.jumpstart.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jumpstart.api.entity.*;
import com.jumpstart.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final AnalysisResultRepository analysisResultRepository;
    private final ClaudeApiService claudeApiService;
    private final StartupRepository startupRepository;
    private final RoleAssignmentRepository roleAssignmentRepository;
    private final RoleGapRepository roleGapRepository;

    @Transactional
    public AnalysisResult analyzeTeam(Long startupId) {
        Startup startup = startupRepository.findById(startupId)
                .orElseThrow(() -> new RuntimeException("Startup not found: " + startupId));

        String prompt = buildPrompt(startup);
        String rawResponse = claudeApiService.analyzeTeam(prompt);
        return parseAndSave(startup, rawResponse);
    }

    private String buildPrompt(Startup startup) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert startup advisor. Analyze this startup team and return a JSON response.\n\n");
        sb.append("STARTUP:\n");
        sb.append("Name: ").append(startup.getName()).append("\n");
        if (startup.getProductDescription() != null)
            sb.append("Product: ").append(startup.getProductDescription()).append("\n");
        if (startup.getBusinessModel() != null)
            sb.append("Business Model: ").append(startup.getBusinessModel()).append("\n");
        if (startup.getKeyChallenges() != null)
            sb.append("Key Challenges: ").append(startup.getKeyChallenges()).append("\n");

        sb.append("\nTEAM MEMBERS:\n");
        for (User member : startup.getMembers()) {
            sb.append("\n- ID: ").append(member.getUserId());
            sb.append(", Name: ").append(member.getName());
            if (member.getHeadline() != null) sb.append(", ").append(member.getHeadline());
            if (member.getExperienceYears() != null)
                sb.append(", ").append(member.getExperienceYears()).append(" yrs exp");
            if (member.getPreferredRole() != null) sb.append(", Prefers: ").append(member.getPreferredRole());
            if (member.getAvailabilityLevel() != null)
                sb.append(", Availability: ").append(member.getAvailabilityLevel());
            if (member.getSkills() != null && !member.getSkills().isEmpty()) {
                sb.append("\n  Skills:");
                for (Skill skill : member.getSkills()) {
                    sb.append("\n    * ").append(skill.getName())
                            .append(" (").append(skill.getCategory())
                            .append(", level ").append(skill.getProficiencyLevel()).append("/10)");
                }
            }
        }

        sb.append("\n\nReturn ONLY valid JSON with this exact structure (no markdown, no explanation):\n");
        sb.append("{\n");
        sb.append("  \"roleAssignments\": [\n");
        sb.append("    {\n");
        sb.append("      \"teamMemberId\": <number>,\n");
        sb.append("      \"assignedRole\": \"<role title>\",\n");
        sb.append("      \"confidence\": <0-100>,\n");
        sb.append("      \"reasoning\": \"<why this person fits this role>\",\n");
        sb.append("      \"responsibilities\": [\"<responsibility1>\", \"<responsibility2>\"]\n");
        sb.append("    }\n");
        sb.append("  ],\n");
        sb.append("  \"roleGaps\": [\n");
        sb.append("    {\n");
        sb.append("      \"roleName\": \"<missing role>\",\n");
        sb.append("      \"importance\": \"CRITICAL|RECOMMENDED|NICE_TO_HAVE\",\n");
        sb.append("      \"whyNeeded\": \"<explanation>\",\n");
        sb.append("      \"skillsToLookFor\": [\"<skill1>\", \"<skill2>\"]\n");
        sb.append("    }\n");
        sb.append("  ],\n");
        sb.append("  \"skillHeatmap\": {\n");
        sb.append("    \"TECHNICAL\": <avg 1-10>,\n");
        sb.append("    \"DESIGN\": <avg 1-10>,\n");
        sb.append("    \"MARKETING\": <avg 1-10>,\n");
        sb.append("    \"SALES\": <avg 1-10>,\n");
        sb.append("    \"OPERATIONS\": <avg 1-10>,\n");
        sb.append("    \"DOMAIN\": <avg 1-10>\n");
        sb.append("  }\n");
        sb.append("}");

        return sb.toString();
    }

    private AnalysisResult parseAndSave(Startup startup, String rawResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String json = extractJson(rawResponse);
            JsonNode root = mapper.readTree(json);

            AnalysisResult result = new AnalysisResult();
            result.setStartup(startup);
            result.setSkillHeatmap(root.path("skillHeatmap").toString());
            result = analysisResultRepository.save(result);

            List<RoleAssignment> assignments = new ArrayList<>();
            for (JsonNode node : root.path("roleAssignments")) {
                Long memberId = node.path("teamMemberId").asLong();
                User member = startup.getMembers().stream()
                        .filter(m -> m.getUserId().equals(memberId))
                        .findFirst().orElse(null);
                if (member == null) continue;

                RoleAssignment ra = new RoleAssignment();
                ra.setAnalysisResult(result);
                ra.setUser(member);
                ra.setAssignedRole(node.path("assignedRole").asText());
                ra.setConfidence(node.path("confidence").asInt());
                ra.setReasoning(node.path("reasoning").asText());
                ra.setResponsibilities(node.path("responsibilities").toString());
                assignments.add(ra);
            }
            roleAssignmentRepository.saveAll(assignments);

            List<RoleGap> gaps = new ArrayList<>();
            for (JsonNode node : root.path("roleGaps")) {
                RoleGap gap = new RoleGap();
                gap.setAnalysisResult(result);
                gap.setRoleName(node.path("roleName").asText());
                gap.setImportance(RoleGap.Importance.valueOf(node.path("importance").asText()));
                gap.setWhyNeeded(node.path("whyNeeded").asText());
                gap.setSkillsToLookFor(node.path("skillsToLookFor").toString());
                gaps.add(gap);
            }
            roleGapRepository.saveAll(gaps);

            result.setRoleAssignments(assignments);
            result.setRoleGaps(gaps);
            return result;

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Claude response: " + e.getMessage(), e);
        }
    }

    // Claude sometimes wraps JSON in markdown code blocks — strip them out
    private String extractJson(String text) {
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }
        return text;
    }

    public AnalysisResult getLatestResult(Long startupId) {
        List<AnalysisResult> results = analysisResultRepository.findByStartupId(startupId);
        if (results.isEmpty()) return null;
        return results.get(results.size() - 1);
    }
}
