package com.jumpstart.api.service;

import com.jumpstart.api.entity.Startup;
import com.jumpstart.api.entity.User;
import com.jumpstart.api.exception.ResourceNotFoundException;
import com.jumpstart.api.repository.StartupRepository;
import com.jumpstart.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamMemberService {

    private final StartupRepository startupRepository;
    private final UserRepository userRepository;

    @Transactional
    public Startup addMember(Long startupId, Long userId) {
        Startup startup = startupRepository.findById(startupId)
                .orElseThrow(() -> new ResourceNotFoundException("Startup", startupId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!startup.getMembers().contains(user)) {
            startup.getMembers().add(user);
            startupRepository.save(startup);
        }
        return startup;
    }

    public List<User> getMembersByStartup(Long startupId) {
        if (!startupRepository.existsById(startupId)) {
            throw new ResourceNotFoundException("Startup", startupId);
        }
        return userRepository.findByMemberStartupsId(startupId);
    }

    @Transactional
    public void removeMember(Long startupId, Long userId) {
        Startup startup = startupRepository.findById(startupId)
                .orElseThrow(() -> new ResourceNotFoundException("Startup", startupId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        startup.getMembers().remove(user);
        startupRepository.save(startup);
    }
}
