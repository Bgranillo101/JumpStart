package com.jumpstart.api.service;

import com.jumpstart.api.entity.Startup;
import com.jumpstart.api.entity.TeamMember;
import com.jumpstart.api.exception.ResourceNotFoundException;
import com.jumpstart.api.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamMemberService {

    private final TeamMemberRepository teamMemberRepository;
    private final StartupService startupService;

    public TeamMember addMember(Long startupId, TeamMember member) {
        if (member.getName() == null || member.getName().isBlank()) {
            throw new IllegalArgumentException("Member name is required");
        }
        if (member.getEmail() == null || member.getEmail().isBlank()) {
            throw new IllegalArgumentException("Member email is required");
        }
        Startup startup = startupService.getStartup(startupId);
        member.setStartup(startup);
        return teamMemberRepository.save(member);
    }

    public List<TeamMember> getMembersByStartup(Long startupId) {
        startupService.getStartup(startupId);
        return teamMemberRepository.findByStartupId(startupId);
    }

    public void removeMember(Long memberId) {
        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", memberId));
        teamMemberRepository.delete(member);
    }
}