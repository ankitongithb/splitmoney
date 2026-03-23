package com.splitmoney.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    @NotNull
    private Long receiverId;

    @NotNull @Positive
    private BigDecimal amount;

    private String description;
    private String currency = "INR";
}
