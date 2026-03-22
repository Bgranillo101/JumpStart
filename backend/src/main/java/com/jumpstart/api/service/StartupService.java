package com.jumpstart.api.service;

import com.jumpstart.api.entity.Startup;
import com.jumpstart.api.entity.User;
import com.jumpstart.api.exception.ResourceNotFoundException;
import com.jumpstart.api.repository.StartupRepository;
import com.jumpstart.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StartupService {

    private final StartupRepository startupRepository;
    private final UserRepository userRepository;

    public Startup createStartup(Startup startup) {
        if (startup.getName() == null || startup.getName().isBlank()) {
            throw new IllegalArgumentException("Startup name is required");
        }
        // Resolve owner to a managed entity so JPA can store the FK correctly
        if (startup.getOwner() != null && startup.getOwner().getUserId() != null) {
            User owner = userRepository.findById(startup.getOwner().getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", startup.getOwner().getUserId()));
            startup.setOwner(owner);
        }
        if (startup.getMembers() == null) {
            startup.setMembers(new ArrayList<>());
        }
        return startupRepository.save(startup);
    }

    public Startup getStartup(Long id) {
        return startupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Startup", id));
    }

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

    public String generateInviteCode(Long startupId) {
        Startup startup = getStartup(startupId);
        String code = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
        startup.setInviteCode(code);
        startupRepository.save(startup);
        return code;
    }

    public Startup joinByInviteCode(String code, Long userId) {
        Startup startup = startupRepository.findByInviteCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid or expired invite code"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (!startup.getMembers().contains(user)) {
            startup.getMembers().add(user);
            startupRepository.save(startup);
        }
        return startup;
    }
}
