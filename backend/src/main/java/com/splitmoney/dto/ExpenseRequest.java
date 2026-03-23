package com.splitmoney.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotNull @Positive
    private BigDecimal amount;

    private String currency = "INR";

    private String category = "Others";

    private String description;

    @NotNull(message = "Date is required")
    private LocalDate expenseDate;
}
