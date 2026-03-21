package com.jumpstart.api.repository;

import com.jumpstart.api.entity.RoleGap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleGapRepository extends JpaRepository<RoleGap, Long> {
    List<RoleGap> findByAnalysisResultId(Long analysisId);
}
