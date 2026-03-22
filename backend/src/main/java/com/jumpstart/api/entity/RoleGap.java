package com.jumpstart.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "role_gaps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleGap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_id", nullable = false)
    private AnalysisResult analysisResult;

    @Column(nullable = false)
    private String roleName;

    @Enumerated(EnumType.STRING)
    private Importance importance;

    @Column(columnDefinition = "TEXT")
    private String whyNeeded;

    @Column(columnDefinition = "TEXT")
    private String skillsToLookFor; // JSON array: ["Growth marketing", "SEO/SEM", ...]

    public enum Importance {
        CRITICAL,
        RECOMMENDED,
        NICE_TO_HAVE
    }
}
