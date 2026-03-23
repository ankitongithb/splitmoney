package com.splitmoney.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
public class TripExpenseRequest {
    @NotBlank
    private String title;

    @NotNull @Positive
    private BigDecimal amount;

    private String splitType = "EQUAL"; // EQUAL or CUSTOM
    private String description;

    @NotNull
    private LocalDate expenseDate;

    // For CUSTOM split: userId -> amount
    private Map<Long, BigDecimal> customSplits;

    private Long paidById;

    private String currency = "INR";
}
