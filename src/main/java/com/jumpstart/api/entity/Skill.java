package com.jumpstart.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_member_id", nullable = false)
    private TeamMember teamMember;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private SkillCategory category;

    private Integer proficiencyLevel; // 1-10

    public enum SkillCategory {
        TECHNICAL,
        DESIGN,
        MARKETING,
        SALES,
        OPERATIONS,
        DOMAIN
    }
}
