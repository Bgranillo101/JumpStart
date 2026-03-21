package com.jumpstart.api.dto;

import com.jumpstart.api.entity.Skill.SkillCategory;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SkillCategoryScore {
    private SkillCategory category;
    private double averageProficiency;
    private int skillCount;
}
