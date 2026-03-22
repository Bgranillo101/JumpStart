package com.jumpstart.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamSkillHeatmapResponse {
    private Long startupId;
    private int memberCount;
    private List<SkillCategoryScore> categories;
    private boolean aiGenerated;

    public TeamSkillHeatmapResponse(Long startupId, int memberCount, List<SkillCategoryScore> categories) {
        this(startupId, memberCount, categories, false);
    }
}
