package com.splitmoney.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
public class BudgetRequest {
    @NotBlank
    private String category;

    @NotNull @Positive
    private BigDecimal amount;

    @NotNull
    private Integer month;

    @NotNull
    private Integer year;
}
