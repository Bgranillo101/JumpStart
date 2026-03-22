package com.jumpstart.api.config;

import com.jumpstart.api.entity.*;
import com.jumpstart.api.entity.Skill.SkillCategory;
import com.jumpstart.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StartupRepository startupRepository;
    private final SkillRepository skillRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final RoleAssignmentRepository roleAssignmentRepository;
    private final RoleGapRepository roleGapRepository;

    private static final String DEMO_USERNAME = "demo";
    private static final String DEMO_PASSWORD = "demo1234";

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.findByUsername(DEMO_USERNAME).isPresent()) {
            log.info("Demo account already exists — skipping seed.");
            return;
        }

        log.info("Seeding demo data...");
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

        // ── Create 5 demo users ─────────────────────────────────────────────
        User alex = createUser("demo", "demo@jumpstart.io", encoder.encode(DEMO_PASSWORD),
                "Alex Chen", "Full-Stack Engineer | 6 yrs", "Lead Developer", 6, "FULL_TIME");
        User maya = createUser("maya_demo", "maya@jumpstart.io", encoder.encode("pass1234"),
                "Maya Patel", "UX/UI Designer | 4 yrs", "Design Lead", 4, "FULL_TIME");
        User jordan = createUser("jordan_demo", "jordan@jumpstart.io", encoder.encode("pass1234"),
                "Jordan Rivera", "Data Scientist | 3 yrs", "ML Engineer", 3, "FULL_TIME");
        User sam = createUser("sam_demo", "sam@jumpstart.io", encoder.encode("pass1234"),
                "Sam Nakamura", "Growth Marketer | 5 yrs", "Marketing Lead", 5, "PART_TIME");
        User taylor = createUser("taylor_demo", "taylor@jumpstart.io", encoder.encode("pass1234"),
                "Taylor Brooks", "DevOps & Cloud | 4 yrs", "Infrastructure Lead", 4, "FULL_TIME");

        // ── Add skills ──────────────────────────────────────────────────────
        addSkills(alex, new Object[][]{
                {"React", SkillCategory.TECHNICAL, 9}, {"TypeScript", SkillCategory.TECHNICAL, 8},
                {"Node.js", SkillCategory.TECHNICAL, 8}, {"PostgreSQL", SkillCategory.TECHNICAL, 7},
                {"System Design", SkillCategory.DOMAIN, 7}, {"Agile/Scrum", SkillCategory.OPERATIONS, 6}
        });
        addSkills(maya, new Object[][]{
                {"Figma", SkillCategory.DESIGN, 9}, {"UI Design", SkillCategory.DESIGN, 9},
                {"User Research", SkillCategory.DESIGN, 7}, {"Prototyping", SkillCategory.DESIGN, 8},
                {"CSS/Tailwind", SkillCategory.TECHNICAL, 6}, {"Brand Strategy", SkillCategory.MARKETING, 5}
        });
        addSkills(jordan, new Object[][]{
                {"Python", SkillCategory.TECHNICAL, 9}, {"TensorFlow", SkillCategory.TECHNICAL, 7},
                {"Data Analysis", SkillCategory.DOMAIN, 8}, {"SQL", SkillCategory.TECHNICAL, 7},
                {"Statistics", SkillCategory.DOMAIN, 8}, {"Jupyter", SkillCategory.TECHNICAL, 6}
        });
        addSkills(sam, new Object[][]{
                {"SEO/SEM", SkillCategory.MARKETING, 8}, {"Content Marketing", SkillCategory.MARKETING, 7},
                {"Social Media", SkillCategory.MARKETING, 8}, {"Analytics", SkillCategory.MARKETING, 7},
                {"Sales Strategy", SkillCategory.SALES, 6}, {"Growth Hacking", SkillCategory.SALES, 7}
        });
        addSkills(taylor, new Object[][]{
                {"AWS", SkillCategory.TECHNICAL, 8}, {"Docker", SkillCategory.TECHNICAL, 8},
                {"Kubernetes", SkillCategory.TECHNICAL, 7}, {"CI/CD", SkillCategory.OPERATIONS, 8},
                {"Monitoring", SkillCategory.OPERATIONS, 7}, {"Terraform", SkillCategory.TECHNICAL, 6}
        });

        // ── Create startup ──────────────────────────────────────────────────
        Startup startup = new Startup();
        startup.setOwner(alex);
        startup.setName("NeuralNest AI");
        startup.setProductDescription(
                "An AI-powered developer productivity platform that uses machine learning to analyze " +
                "codebases, suggest refactors, auto-generate tests, and predict deployment risks. " +
                "Targets mid-size engineering teams (10-50 devs) with a SaaS subscription model.");
        startup.setBusinessModel("B2B SaaS — $49/seat/month with enterprise tier at custom pricing");
        startup.setKeyChallenges(
                "Building reliable ML models for diverse codebases, achieving sub-second analysis latency, " +
                "competing with GitHub Copilot and established DevOps tools, reaching product-market fit " +
                "before Series A runway ends.");
        startup.setInviteCode("DEMO2026");
        startup.setMembers(new ArrayList<>(List.of(alex, maya, jordan, sam, taylor)));
        startup = startupRepository.save(startup);

        // ── Pre-run analysis result ─────────────────────────────────────────
        AnalysisResult analysis = new AnalysisResult();
        analysis.setStartup(startup);
        analysis.setTeamReadinessScore(78);
        analysis.setSkillHeatmap("{\"TECHNICAL\":8.2,\"DESIGN\":8.0,\"MARKETING\":7.5,\"SALES\":6.5,\"OPERATIONS\":7.0,\"DOMAIN\":7.7}");
        analysis = analysisResultRepository.save(analysis);

        // Role assignments
        createRoleAssignment(analysis, alex, "Chief Technology Officer", 92,
                "Deep full-stack expertise with system design skills makes Alex ideal to lead technical strategy.",
                "[\"Architecture decisions\",\"Code review standards\",\"Technical hiring\",\"Sprint planning\"]");
        createRoleAssignment(analysis, maya, "Head of Design", 95,
                "Expert-level Figma and UI design skills with strong user research background.",
                "[\"Design system ownership\",\"User research\",\"Prototyping\",\"Brand identity\"]");
        createRoleAssignment(analysis, jordan, "Lead ML Engineer", 88,
                "Strong Python and TensorFlow skills combined with deep data analysis expertise.",
                "[\"ML model development\",\"Data pipeline architecture\",\"Model evaluation\",\"Research\"]");
        createRoleAssignment(analysis, sam, "Growth Lead", 85,
                "Comprehensive marketing skill set covering SEO, content, and growth hacking.",
                "[\"Go-to-market strategy\",\"Content calendar\",\"Analytics reporting\",\"User acquisition\"]");
        createRoleAssignment(analysis, taylor, "Infrastructure Lead", 90,
                "Strong DevOps toolkit with AWS, Docker, and Kubernetes expertise.",
                "[\"Cloud infrastructure\",\"CI/CD pipelines\",\"Monitoring & alerting\",\"Cost optimization\"]");

        // Role gaps
        createRoleGap(analysis, "Product Manager", RoleGap.Importance.CRITICAL,
                "No dedicated PM to prioritize features, manage roadmap, and bridge engineering with business goals.",
                "[\"Product strategy\",\"Roadmapping\",\"Stakeholder management\",\"User story writing\"]");
        createRoleGap(analysis, "Sales Representative", RoleGap.Importance.RECOMMENDED,
                "Sam covers marketing but the team lacks dedicated B2B sales outreach capabilities.",
                "[\"Enterprise sales\",\"CRM management\",\"Demo presentations\",\"Contract negotiation\"]");

        log.info("Demo data seeded successfully — startup '{}' with {} members.",
                startup.getName(), startup.getMembers().size());
    }

    private User createUser(String username, String email, String password,
                            String name, String headline, String preferredRole,
                            int experienceYears, String availability) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        user.setName(name);
        user.setHeadline(headline);
        user.setPreferredRole(preferredRole);
        user.setExperienceYears(experienceYears);
        user.setAvailabilityLevel(availability);
        return userRepository.save(user);
    }

    private void addSkills(User user, Object[][] skillData) {
        for (Object[] s : skillData) {
            Skill skill = new Skill();
            skill.setUser(user);
            skill.setName((String) s[0]);
            skill.setCategory((SkillCategory) s[1]);
            skill.setProficiencyLevel((Integer) s[2]);
            skillRepository.save(skill);
        }
    }

    private void createRoleAssignment(AnalysisResult analysis, User user,
                                       String role, int confidence, String reasoning, String responsibilities) {
        RoleAssignment ra = new RoleAssignment();
        ra.setAnalysisResult(analysis);
        ra.setUser(user);
        ra.setAssignedRole(role);
        ra.setConfidence(confidence);
        ra.setReasoning(reasoning);
        ra.setResponsibilities(responsibilities);
        roleAssignmentRepository.save(ra);
    }

    private void createRoleGap(AnalysisResult analysis, String roleName,
                                RoleGap.Importance importance, String whyNeeded, String skillsToLookFor) {
        RoleGap gap = new RoleGap();
        gap.setAnalysisResult(analysis);
        gap.setRoleName(roleName);
        gap.setImportance(importance);
        gap.setWhyNeeded(whyNeeded);
        gap.setSkillsToLookFor(skillsToLookFor);
        roleGapRepository.save(gap);
    }
}
