package com.jumpstart.api.repository;

import com.jumpstart.api.entity.Startup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StartupRepository extends JpaRepository<Startup, Long> {
    Optional<Startup> findFirstByOwnerUserId(Long userId);

    @Query("SELECT s FROM Startup s JOIN s.members m WHERE m.userId = :userId")
    Optional<Startup> findFirstByMembersUserId(@Param("userId") Long userId);
}
