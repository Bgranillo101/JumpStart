package com.jumpstart.api.repository;

import com.jumpstart.api.entity.Startup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StartupRepository extends JpaRepository<Startup, Long> {
    Optional<Startup> findByInviteCode(String inviteCode);
}
