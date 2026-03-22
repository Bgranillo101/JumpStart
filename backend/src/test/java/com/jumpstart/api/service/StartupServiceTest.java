package com.jumpstart.api.service;

import com.jumpstart.api.entity.Startup;
import com.jumpstart.api.entity.User;
import com.jumpstart.api.exception.ResourceNotFoundException;
import com.jumpstart.api.repository.StartupRepository;
import com.jumpstart.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StartupServiceTest {

    @Mock
    private StartupRepository startupRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private StartupService startupService;

    private User owner;
    private Startup startup;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setUserId(1L);
        owner.setUsername("alice");
        owner.setEmail("alice@example.com");
        owner.setPassword("hashed");

        startup = new Startup();
        startup.setId(10L);
        startup.setName("AcmeCo");
        startup.setOwner(owner);
        startup.setMembers(new ArrayList<>());
    }

    @Test
    void createStartup_savesWithOwner() {
        Startup input = new Startup();
        input.setName("NewCo");
        input.setMembers(new ArrayList<>());

        when(userRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(startupRepository.save(any(Startup.class))).thenAnswer(inv -> {
            Startup s = inv.getArgument(0);
            s.setId(99L);
            return s;
        });

        Startup result = startupService.createStartup(input, 1L);

        assertThat(result.getId()).isEqualTo(99L);
        assertThat(result.getOwner()).isEqualTo(owner);
        verify(startupRepository).save(input);
    }

    @Test
    void createStartup_throwsWhenNameBlank() {
        Startup input = new Startup();
        input.setName("   ");

        assertThatThrownBy(() -> startupService.createStartup(input, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("name is required");
    }

    @Test
    void createStartup_throwsWhenOwnerNotFound() {
        Startup input = new Startup();
        input.setName("NewCo");

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> startupService.createStartup(input, 99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateStartup_patchesProvidedFields() {
        when(startupRepository.findById(10L)).thenReturn(Optional.of(startup));
        when(startupRepository.save(any(Startup.class))).thenAnswer(inv -> inv.getArgument(0));

        Startup patch = new Startup();
        patch.setName("AcmeCo v2");
        patch.setProductDescription("Best SaaS ever");
        patch.setMembers(new ArrayList<>());

        Startup result = startupService.updateStartup(10L, patch);

        assertThat(result.getName()).isEqualTo("AcmeCo v2");
        assertThat(result.getProductDescription()).isEqualTo("Best SaaS ever");
    }

    @Test
    void generateInviteLink_throwsWhenNotOwner() {
        User other = new User();
        other.setUserId(2L);
        startup.setOwner(owner);

        when(startupRepository.findById(10L)).thenReturn(Optional.of(startup));

        assertThatThrownBy(() -> startupService.generateInviteLink(10L, 2L, "http://localhost:5173"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("owner");
    }

    @Test
    void joinByInviteCode_addsMemberWhenNotAlreadyPresent() {
        startup.setInviteCode("ABC12345");

        User newMember = new User();
        newMember.setUserId(5L);
        newMember.setUsername("bob");

        when(startupRepository.findByInviteCode("ABC12345")).thenReturn(Optional.of(startup));
        when(userRepository.findById(5L)).thenReturn(Optional.of(newMember));
        when(startupRepository.save(any(Startup.class))).thenAnswer(inv -> inv.getArgument(0));

        Startup result = startupService.joinByInviteCode("ABC12345", 5L);

        assertThat(result.getMembers()).contains(newMember);
        verify(startupRepository).save(startup);
    }
}
