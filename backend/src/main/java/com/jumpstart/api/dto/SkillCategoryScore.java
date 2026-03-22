package com.jumpstart.api.dto;

import com.jumpstart.api.entity.Skill.SkillCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillCategoryScore {
    private SkillCategory category;
    private double averageProficiency;
    private int skillCount;
    private String insight;

    public SkillCategoryScore(SkillCategory category, double averageProficiency, int skillCount) {
        this(category, averageProficiency, skillCount, null);
    }
}
