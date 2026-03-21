package com.jumpstart.api.service;

import com.jumpstart.api.dto.*;
import com.jumpstart.api.entity.Skill;
import com.jumpstart.api.entity.Skill.SkillCategory;
import com.jumpstart.api.entity.User;
import com.jumpstart.api.exception.ResourceNotFoundException;
import com.jumpstart.api.repository.SkillRepository;
import com.jumpstart.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillHeatmapService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;
    private final StartupService startupService;

    public MemberSkillHeatmapResponse getMemberHeatmap(Long startupId, Long userId) {
        startupService.getStartup(startupId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<Skill> skills = skillRepository.findByUserUserId(userId);
        List<SkillCategoryScore> scores = aggregateByCategory(skills);

        return new MemberSkillHeatmapResponse(user.getUserId(), user.getName(), scores);
    }

    public TeamSkillHeatmapResponse getTeamHeatmap(Long startupId) {
        startupService.getStartup(startupId);

        List<User> members = userRepository.findByMemberStartupsId(startupId);
        List<Skill> allSkills = skillRepository.findByUserMemberStartupsId(startupId);
        List<SkillCategoryScore> scores = aggregateByCategory(allSkills);

        return new TeamSkillHeatmapResponse(startupId, members.size(), scores);
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
