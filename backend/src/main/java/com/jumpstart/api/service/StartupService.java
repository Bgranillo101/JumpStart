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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StartupService {

    private final StartupRepository startupRepository;
    private final UserRepository userRepository;

    public Startup createStartup(Startup startup, Long ownerId) {
        if (startup.getName() == null || startup.getName().isBlank()) {
            throw new IllegalArgumentException("Startup name is required");
        }
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", ownerId));
        startup.setOwner(owner);
        startup.getMembers().add(owner);
        return startupRepository.save(startup);
    }

    @Transactional(readOnly = true)
    public Startup getStartup(Long id) {
        return startupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Startup", id));
    }

    @Transactional(readOnly = true)
    public List<Startup> getAllStartups() {
        return startupRepository.findAll();
    }

    public Startup updateStartup(Long id, Startup updated) {
        Startup existing = getStartup(id);
        if (updated.getName() != null && !updated.getName().isBlank()) {
            existing.setName(updated.getName());
        }
        if (updated.getProductDescription() != null) {
            existing.setProductDescription(updated.getProductDescription());
        }
        if (updated.getBusinessModel() != null) {
            existing.setBusinessModel(updated.getBusinessModel());
        }
        if (updated.getKeyChallenges() != null) {
            existing.setKeyChallenges(updated.getKeyChallenges());
        }
        return startupRepository.save(existing);
    }

    public void deleteStartup(Long id) {
        Startup startup = getStartup(id);
        startupRepository.delete(startup);
    }

    public String generateInviteLink(Long startupId, Long requestingUserId, String frontendUrl) {
        Startup startup = getStartup(startupId);
        if (!startup.getOwner().getUserId().equals(requestingUserId)) {
            throw new IllegalStateException("Only the startup owner can generate an invite code");
        }
        if (startup.getInviteCode() == null) {
            startup.setInviteCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            startupRepository.save(startup);
        }
        return frontendUrl + "/join?code=" + startup.getInviteCode();
    }

    public Startup joinByInviteCode(String code, Long userId) {
        Startup startup = startupRepository.findByInviteCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invite code"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (!startup.getMembers().contains(user)) {
            startup.getMembers().add(user);
            startupRepository.save(startup);
        }
        return startup;
    }
}
