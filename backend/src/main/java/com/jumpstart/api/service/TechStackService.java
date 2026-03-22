package com.jumpstart.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jumpstart.api.entity.*;
import com.jumpstart.api.exception.ResourceNotFoundException;
import com.jumpstart.api.repository.AnalysisResultRepository;
import com.jumpstart.api.repository.StartupRepository;
import com.jumpstart.api.repository.TechStackRecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TechStackService {

    private final ClaudeApiService claudeApiService;
    private final StartupRepository startupRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final TechStackRecommendationRepository techStackRepository;

    @Transactional
    public List<TechStackRecommendation> recommendTechStack(Long startupId) {
        Startup startup = startupRepository.findById(startupId)
                .orElseThrow(() -> new ResourceNotFoundException("Startup", startupId));

        List<AnalysisResult> results = analysisResultRepository.findByStartupId(startupId);
        AnalysisResult latestResult = results.isEmpty() ? null : results.get(results.size() - 1);

        if (latestResult == null) {
            throw new IllegalStateException("Run a team analysis first before generating tech stack recommendations.");
        }

        String prompt = buildPrompt(startup, latestResult);
        String rawResponse = claudeApiService.analyzeTeam(prompt);
        return parseAndSave(latestResult, rawResponse);
    }

    public List<TechStackRecommendation> getTechStack(Long startupId) {
        List<AnalysisResult> results = analysisResultRepository.findByStartupId(startupId);
        if (results.isEmpty()) return Collections.emptyList();
        AnalysisResult latest = results.get(results.size() - 1);
        return techStackRepository.findByAnalysisResultId(latest.getId());
    }

    private String buildPrompt(Startup startup, AnalysisResult analysis) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert CTO advisor. Based on the startup's description and team skills, recommend an ideal tech stack.\n\n");
        sb.append("STARTUP:\n");
        sb.append("Name: ").append(startup.getName()).append("\n");
        if (startup.getProductDescription() != null)
            sb.append("Product: ").append(startup.getProductDescription()).append("\n");
        if (startup.getBusinessModel() != null)
            sb.append("Business Model: ").append(startup.getBusinessModel()).append("\n");
        if (startup.getKeyChallenges() != null)
            sb.append("Key Challenges: ").append(startup.getKeyChallenges()).append("\n");

        sb.append("\nTEAM SKILLS:\n");
        for (User member : startup.getMembers()) {
            sb.append("- ").append(member.getName() != null ? member.getName() : member.getUsername());
            if (member.getSkills() != null && !member.getSkills().isEmpty()) {
                sb.append(": ");
                for (Skill skill : member.getSkills()) {
                    sb.append(skill.getName()).append(" (").append(skill.getProficiencyLevel()).append("/10), ");
                }
            }
            sb.append("\n");
        }

        if (analysis.getRoleAssignments() != null) {
            sb.append("\nROLE ASSIGNMENTS:\n");
            for (RoleAssignment ra : analysis.getRoleAssignments()) {
                sb.append("- ").append(ra.getUser().getName() != null ? ra.getUser().getName() : ra.getUser().getUsername());
                sb.append(" → ").append(ra.getAssignedRole());
                sb.append(" (").append(ra.getConfidence()).append("% confidence)\n");
            }
        }

        sb.append("\nReturn ONLY valid JSON with this exact structure (no markdown, no explanation):\n");
        sb.append("{\n");
        sb.append("  \"techStack\": [\n");
        sb.append("    {\n");
        sb.append("      \"name\": \"<technology name>\",\n");
        sb.append("      \"category\": \"LANGUAGE|FRAMEWORK|DATABASE|TOOL|INFRASTRUCTURE\",\n");
        sb.append("      \"reasoning\": \"<why this technology fits this team and product>\",\n");
        sb.append("      \"priority\": <1=must-have, 2=recommended, 3=nice-to-have>\n");
        sb.append("    }\n");
        sb.append("  ]\n");
        sb.append("}\n");
        sb.append("Recommend 6-10 technologies covering languages, frameworks, databases, tools, and infrastructure.");

        return sb.toString();
    }

    private List<TechStackRecommendation> parseAndSave(AnalysisResult analysisResult, String rawResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String json = extractJson(rawResponse);
            JsonNode root = mapper.readTree(json);

            // Delete old recommendations for this analysis result
            List<TechStackRecommendation> old = techStackRepository.findByAnalysisResultId(analysisResult.getId());
            techStackRepository.deleteAll(old);

            List<TechStackRecommendation> recommendations = new ArrayList<>();
            for (JsonNode node : root.path("techStack")) {
                TechStackRecommendation rec = new TechStackRecommendation();
                rec.setAnalysisResult(analysisResult);
                rec.setName(node.path("name").asText());
                rec.setCategory(node.path("category").asText());
                rec.setReasoning(node.path("reasoning").asText());
                rec.setPriority(node.path("priority").asInt(2));
                recommendations.add(rec);
            }

            return techStackRepository.saveAll(recommendations);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse tech stack response: " + e.getMessage(), e);
        }
    }

    private String extractJson(String text) {
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }
        return text;
    }
}
