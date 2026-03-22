package com.jumpstart.api.repository;

import com.jumpstart.api.entity.TechStackRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TechStackRecommendationRepository extends JpaRepository<TechStackRecommendation, Long> {
    List<TechStackRecommendation> findByAnalysisResultId(Long analysisResultId);
}
