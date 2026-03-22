package com.jumpstart.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tech_stack_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TechStackRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analysis_result_id", nullable = false)
    private AnalysisResult analysisResult;

    private String name;

    private String category; // LANGUAGE, FRAMEWORK, DATABASE, TOOL, INFRASTRUCTURE

    @Column(columnDefinition = "TEXT")
    private String reasoning;

    private Integer priority; // 1=must-have, 2=recommended, 3=nice-to-have

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
