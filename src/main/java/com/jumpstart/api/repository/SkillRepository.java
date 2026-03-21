package com.jumpstart.api.repository;

import com.jumpstart.api.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByTeamMemberId(Long teamMemberId);
}
