package com.jumpstart.api.service;

import com.jumpstart.api.entity.*;
import com.jumpstart.api.exception.ResourceNotFoundException;
import com.jumpstart.api.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalysisServiceTest {

    @Mock
    private AnalysisResultRepository analysisResultRepository;

    @Mock
    private ClaudeApiService claudeApiService;

    @Mock
    private StartupRepository startupRepository;

    @Mock
    private RoleAssignmentRepository roleAssignmentRepository;

    @Mock
    private RoleGapRepository roleGapRepository;

    @InjectMocks
    private AnalysisService analysisService;

    private Startup startup;
    private User member;

    private static final String VALID_CLAUDE_RESPONSE = """
            {
              "roleAssignments": [
                {
                  "teamMemberId": 1,
                  "assignedRole": "CTO",
                  "confidence": 90,
                  "reasoning": "Strong technical background",
                  "responsibilities": ["Architecture", "Code reviews"]
                }
              ],
              "roleGaps": [
                {
                  "roleName": "CMO",
                  "importance": "CRITICAL",
                  "whyNeeded": "No marketing expertise on team",
                  "skillsToLookFor": ["SEO", "Growth hacking"]
                }
              ],
              "skillHeatmap": {
                "TECHNICAL": 8,
                "DESIGN": 4,
                "MARKETING": 2,
                "SALES": 3,
                "OPERATIONS": 5,
                "DOMAIN": 6
              },
              "teamReadinessScore": 72
            }
            """;

    @BeforeEach
    void setUp() {
        member = new User();
        member.setUserId(1L);
        member.setUsername("alice");
        member.setEmail("alice@example.com");
        member.setPassword("hashed");
        member.setSkills(new ArrayList<>());

        startup = new Startup();
        startup.setId(1L);
        startup.setName("TechCo");
        startup.setMembers(List.of(member));
    }

    @Test
    void analyzeTeam_parsesResponseAndPersistsResult() {
        when(startupRepository.findById(1L)).thenReturn(Optional.of(startup));
        when(claudeApiService.analyzeTeam(anyString())).thenReturn(VALID_CLAUDE_RESPONSE);
        when(analysisResultRepository.save(any(AnalysisResult.class))).thenAnswer(inv -> {
            AnalysisResult r = inv.getArgument(0);
            r.setId(100L);
            return r;
        });
        when(roleAssignmentRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
        when(roleGapRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        AnalysisResult result = analysisService.analyzeTeam(1L);

        assertThat(result.getTeamReadinessScore()).isEqualTo(72);
        assertThat(result.getRoleAssignments()).hasSize(1);
        assertThat(result.getRoleAssignments().get(0).getAssignedRole()).isEqualTo("CTO");
        assertThat(result.getRoleGaps()).hasSize(1);
        assertThat(result.getRoleGaps().get(0).getRoleName()).isEqualTo("CMO");
        assertThat(result.getRoleGaps().get(0).getImportance()).isEqualTo(RoleGap.Importance.CRITICAL);
    }

    @Test
    void analyzeTeam_throwsWhenStartupNotFound() {
        when(startupRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> analysisService.analyzeTeam(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void analyzeTeam_throwsWhenClaudeReturnsInvalidJson() {
        when(startupRepository.findById(1L)).thenReturn(Optional.of(startup));
        when(claudeApiService.analyzeTeam(anyString())).thenReturn("not valid json at all");

        assertThatThrownBy(() -> analysisService.analyzeTeam(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to parse");
    }

    @Test
    void getLatestResult_returnsNullWhenNoResults() {
        when(analysisResultRepository.findByStartupId(1L)).thenReturn(new ArrayList<>());

        AnalysisResult result = analysisService.getLatestResult(1L);

        assertThat(result).isNull();
    }

    @Test
    void getLatestResult_returnsLastWhenMultipleExist() {
        AnalysisResult r1 = new AnalysisResult();
        r1.setId(1L);
        AnalysisResult r2 = new AnalysisResult();
        r2.setId(2L);

        when(analysisResultRepository.findByStartupId(1L)).thenReturn(List.of(r1, r2));

        AnalysisResult result = analysisService.getLatestResult(1L);

        assertThat(result.getId()).isEqualTo(2L);
    }
}
