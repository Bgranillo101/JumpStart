package com.jumpstart.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jumpstart.api.dto.*;
import com.jumpstart.api.entity.Skill;
import com.jumpstart.api.entity.Skill.SkillCategory;
import com.jumpstart.api.entity.Startup;
import com.jumpstart.api.entity.User;
import com.jumpstart.api.exception.ResourceNotFoundException;
import com.jumpstart.api.repository.SkillRepository;
import com.jumpstart.api.repository.StartupRepository;
import com.jumpstart.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SkillHeatmapService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;
    private final StartupService startupService;
    private final StartupRepository startupRepository;
    private final ClaudeApiService claudeApiService;
    private final ObjectMapper objectMapper;

    public MemberSkillHeatmapResponse getMemberHeatmap(Long startupId, Long userId) {
        startupService.getStartup(startupId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<Skill> skills = skillRepository.findByUserUserId(userId);
        List<SkillCategoryScore> scores = aggregateByCategory(skills);

        return new MemberSkillHeatmapResponse(user.getUserId(), user.getName(), scores);
    }

    public TeamSkillHeatmapResponse getTeamHeatmap(Long startupId) {
        Startup startup = startupRepository.findById(startupId)
                .orElseThrow(() -> new ResourceNotFoundException("Startup", startupId));

        List<User> members = userRepository.findByMemberStartupsId(startupId);
        List<Skill> allSkills = skillRepository.findByUserMemberStartupsId(startupId);
        List<SkillCategoryScore> baseScores = aggregateByCategory(allSkills);

        // Attempt AI-enhanced scoring if startup has context and skills exist
        if (startup.getProductDescription() != null && !allSkills.isEmpty()) {
            try {
                List<SkillCategoryScore> aiScores = generateAiHeatmap(startup, members, allSkills, baseScores);
                return new TeamSkillHeatmapResponse(startupId, members.size(), aiScores, true);
            } catch (Exception e) {
                log.warn("AI heatmap generation failed, using simple averages", e);
            }
        }

        return new TeamSkillHeatmapResponse(startupId, members.size(), baseScores, false);
    }

    private List<SkillCategoryScore> generateAiHeatmap(
            Startup startup, List<User> members, List<Skill> allSkills,
            List<SkillCategoryScore> baseScores) {
        String prompt = buildHeatmapPrompt(startup, members, allSkills, baseScores);
        String rawResponse = claudeApiService.analyzeTeam(prompt);
        return parseAiHeatmapResponse(rawResponse, allSkills);
    }

    private String buildHeatmapPrompt(Startup startup, List<User> members,
                                       List<Skill> allSkills, List<SkillCategoryScore> baseScores) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert startup team analyst. Evaluate this startup team's skill coverage ");
        sb.append("and provide adjusted proficiency scores that account for skill relevance to the ");
        sb.append("startup's goals, depth vs. breadth of coverage, and critical gaps.\n\n");

        sb.append("STARTUP:\n");
        sb.append("Name: ").append(startup.getName()).append("\n");
        sb.append("Product: ").append(startup.getProductDescription()).append("\n");
        if (startup.getBusinessModel() != null)
            sb.append("Business Model: ").append(startup.getBusinessModel()).append("\n");
        if (startup.getKeyChallenges() != null)
            sb.append("Key Challenges: ").append(startup.getKeyChallenges()).append("\n");

        sb.append("\nTEAM SKILLS:\n");
        for (User member : members) {
            List<Skill> memberSkills = allSkills.stream()
                    .filter(s -> s.getUser().getUserId().equals(member.getUserId()))
                    .collect(Collectors.toList());
            if (!memberSkills.isEmpty()) {
                sb.append("- ").append(member.getName() != null ? member.getName() : member.getUsername()).append(":\n");
                for (Skill skill : memberSkills) {
                    sb.append("    * ").append(skill.getName())
                            .append(" (").append(skill.getCategory())
                            .append(", level ").append(skill.getProficiencyLevel()).append("/10)\n");
                }
            }
        }

        sb.append("\nRAW AVERAGES (for reference):\n");
        for (SkillCategoryScore score : baseScores) {
            sb.append(score.getCategory()).append(": ").append(String.format("%.1f", score.getAverageProficiency()));
            sb.append(" (").append(score.getSkillCount()).append(" skills)\n");
        }

        sb.append("\nReturn ONLY valid JSON (no markdown, no explanation) with this exact structure:\n");
        sb.append("{\n");
        sb.append("  \"TECHNICAL\": { \"adjustedScore\": <1.0-10.0>, \"insight\": \"<1 sentence>\" },\n");
        sb.append("  \"DESIGN\": { \"adjustedScore\": <1.0-10.0>, \"insight\": \"<1 sentence>\" },\n");
        sb.append("  \"MARKETING\": { \"adjustedScore\": <1.0-10.0>, \"insight\": \"<1 sentence>\" },\n");
        sb.append("  \"SALES\": { \"adjustedScore\": <1.0-10.0>, \"insight\": \"<1 sentence>\" },\n");
        sb.append("  \"OPERATIONS\": { \"adjustedScore\": <1.0-10.0>, \"insight\": \"<1 sentence>\" },\n");
        sb.append("  \"DOMAIN\": { \"adjustedScore\": <1.0-10.0>, \"insight\": \"<1 sentence>\" }\n");
        sb.append("}\n\n");
        sb.append("Rules:\n");
        sb.append("- adjustedScore should reflect how well the team's skills in this category serve the startup's specific needs\n");
        sb.append("- If skills are irrelevant to the product, score lower than the raw average\n");
        sb.append("- If a category is critical but undermanned, score lower to highlight the gap\n");
        sb.append("- insight should be actionable and specific to this startup\n");

        return sb.toString();
    }

    private List<SkillCategoryScore> parseAiHeatmapResponse(String rawResponse, List<Skill> allSkills) {
        try {
            String json = extractJson(rawResponse);
            JsonNode root = objectMapper.readTree(json);

            // Count skills per category from raw data
            Map<SkillCategory, Long> skillCounts = allSkills.stream()
                    .collect(Collectors.groupingBy(Skill::getCategory, Collectors.counting()));

            List<SkillCategoryScore> scores = new ArrayList<>();
            for (SkillCategory category : SkillCategory.values()) {
                JsonNode node = root.path(category.name());
                if (node.isMissingNode()) {
                    scores.add(new SkillCategoryScore(category, 0.0, 0));
                    continue;
                }
                double adjustedScore = node.path("adjustedScore").asDouble(0.0);
                String insight = node.path("insight").asText(null);
                int count = skillCounts.getOrDefault(category, 0L).intValue();
                scores.add(new SkillCategoryScore(category, adjustedScore, count, insight));
            }
            return scores;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI heatmap response: " + e.getMessage(), e);
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

    private List<SkillCategoryScore> aggregateByCategory(List<Skill> skills) {
        Map<SkillCategory, List<Skill>> grouped = skills.stream()
                .collect(Collectors.groupingBy(Skill::getCategory));

        List<SkillCategoryScore> scores = new ArrayList<>();
        for (SkillCategory category : SkillCategory.values()) {
            List<Skill> categorySkills = grouped.getOrDefault(category, Collections.emptyList());
            double avg = categorySkills.stream()
                    .map(Skill::getProficiencyLevel)
                    .filter(Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .average()
                    .orElse(0.0);
            scores.add(new SkillCategoryScore(category, avg, categorySkills.size()));
        }
        return scores;
    }
}
