package com.splitmoney.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
public class WalletRequest {
    @NotNull @Positive
    private BigDecimal amount;

    private String description;

    // For send money
    private Long receiverId;
}
