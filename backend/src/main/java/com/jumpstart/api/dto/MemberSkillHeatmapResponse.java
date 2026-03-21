package com.jumpstart.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class MemberSkillHeatmapResponse {
    private Long memberId;
    private String memberName;
    private List<SkillCategoryScore> categories;
}
