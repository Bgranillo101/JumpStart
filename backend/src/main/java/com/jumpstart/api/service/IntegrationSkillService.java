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
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        for (Skill skill : skills) {
            skill.setUser(user);
        }

        return skillRepository.saveAll(skills);
    }

    public User getUserWithSkills(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}
