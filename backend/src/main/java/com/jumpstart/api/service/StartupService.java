package com.jumpstart.api.service;

import com.jumpstart.api.entity.Startup;
import com.jumpstart.api.exception.ResourceNotFoundException;
import com.jumpstart.api.repository.StartupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StartupService {

    private final StartupRepository startupRepository;

    public Startup createStartup(Startup startup) {
        if (startup.getName() == null || startup.getName().isBlank()) {
            throw new IllegalArgumentException("Startup name is required");
        }
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
}
