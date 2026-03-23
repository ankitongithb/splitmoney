package com.splitmoney.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ExpenseResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String title;
    private BigDecimal amount;
    private String currency;
    private BigDecimal amountInr;
    private String category;
    private String description;
    private LocalDate expenseDate;
    private String receiptUrl;
    private LocalDateTime createdAt;
}
