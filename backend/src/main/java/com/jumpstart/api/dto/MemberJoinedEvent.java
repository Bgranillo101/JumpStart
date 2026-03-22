package com.jumpstart.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberJoinedEvent {
    private Long userId;
    private String name;
    private String username;
}
