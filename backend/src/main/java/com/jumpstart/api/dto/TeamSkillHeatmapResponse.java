package com.jumpstart.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class TeamSkillHeatmapResponse {
    private Long startupId;
    private int memberCount;
    private List<SkillCategoryScore> categories;
}
