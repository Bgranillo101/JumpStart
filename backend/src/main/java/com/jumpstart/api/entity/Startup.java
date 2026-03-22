package com.jumpstart.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "startups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Startup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    private User owner;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "startup_members",
            joinColumns = @JoinColumn(name = "startup_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members = new ArrayList<>();

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String productDescription;

    private String businessModel;

    @Column(columnDefinition = "TEXT")
    private String keyChallenges;

    private LocalDateTime createdAt;

    @Column(unique = true)
    private String inviteCode;

    @JsonIgnore
    @OneToMany(mappedBy = "startup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnalysisResult> analysisResults = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
