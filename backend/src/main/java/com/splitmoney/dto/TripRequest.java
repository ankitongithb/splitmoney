package com.splitmoney.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Data
public class TripRequest {
    @NotBlank
    private String name;
    private String description;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<Long> memberIds;
}
