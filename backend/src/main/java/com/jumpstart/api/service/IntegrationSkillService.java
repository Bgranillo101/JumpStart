package com.jumpstart.api.service;

import com.jumpstart.api.entity.Skill;
import com.jumpstart.api.entity.User;
import com.jumpstart.api.exception.ResourceNotFoundException;
import com.jumpstart.api.repository.SkillRepository;
import com.jumpstart.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IntegrationSkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public List<Skill> addSkills(Long userId, List<Skill> skills) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        for (Skill skill : skills) {
            skill.setUser(user);
        }

        return skillRepository.saveAll(skills);
    }

    public User getUserWithSkills(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    public User updateUserProfile(Long userId, String name, String preferredRole,
                                   String headline, Integer experienceYears,
                                   String availabilityLevel, String education) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (name != null) user.setName(name);
        if (preferredRole != null) user.setPreferredRole(preferredRole);
        if (headline != null) user.setHeadline(headline);
        if (experienceYears != null) user.setExperienceYears(experienceYears);
        if (availabilityLevel != null) user.setAvailabilityLevel(availabilityLevel);
        if (education != null) user.setEducation(education);
        return userRepository.save(user);
    }

    public void removeSkill(Long userId, Long skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", skillId));
        if (!skill.getUser().getUserId().equals(userId)) {
            throw new IllegalStateException("Skill does not belong to this user");
        }
        skillRepository.delete(skill);
    }
}
