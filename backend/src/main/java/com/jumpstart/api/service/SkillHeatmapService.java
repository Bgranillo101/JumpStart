package com.jumpstart.api.service;

import com.jumpstart.api.dto.*;
import com.jumpstart.api.entity.Skill;
import com.jumpstart.api.entity.Skill.SkillCategory;
import com.jumpstart.api.entity.TeamMember;
import com.jumpstart.api.exception.ResourceNotFoundException;
import com.jumpstart.api.repository.SkillRepository;
import com.jumpstart.api.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillHeatmapService {

    private final SkillRepository skillRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final StartupService startupService;

    public MemberSkillHeatmapResponse getMemberHeatmap(Long startupId, Long memberId) {
        startupService.getStartup(startupId);

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", memberId));

        if (!member.getStartup().getId().equals(startupId)) {
            throw new ResourceNotFoundException("TeamMember", memberId);
        }

        List<Skill> skills = skillRepository.findByTeamMemberId(memberId);
        List<SkillCategoryScore> scores = aggregateByCategory(skills);

        return new MemberSkillHeatmapResponse(member.getId(), member.getName(), scores);
    }

    public TeamSkillHeatmapResponse getTeamHeatmap(Long startupId) {
        startupService.getStartup(startupId);

        List<TeamMember> members = teamMemberRepository.findByStartupId(startupId);
        List<Skill> allSkills = skillRepository.findByTeamMemberStartupId(startupId);
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
