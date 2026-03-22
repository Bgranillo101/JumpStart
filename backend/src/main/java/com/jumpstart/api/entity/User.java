package com.jumpstart.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    // --- Auth ---
    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    // --- Profile ---
    private String name;           // Full display name, e.g. "Jane Smith"
    private String headline;       // e.g. "Full-Stack Engineer | 5 yrs"
    private String preferredRole;
    private Integer experienceYears;
    private String availabilityLevel; // FULL_TIME, PART_TIME, ADVISORY
    private String education;

    private LocalDateTime createdAt;

    // --- Relationships ---
    @JsonIgnore
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Startup> ownedStartups;

    @JsonIgnore
    @ManyToMany(mappedBy = "members")
    private List<Startup> memberStartups;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Skill> skills;

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoleAssignment> roleAssignments;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
