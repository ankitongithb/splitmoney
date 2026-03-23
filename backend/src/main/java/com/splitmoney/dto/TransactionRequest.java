package com.splitmoney.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {
    @NotNull
    private Long friendId;

    @NotNull @Positive
    private BigDecimal amount;

    private String description;
    private String category = "Others";

    @NotNull
    private LocalDate transactionDate;

    // true = friend owes me; false = I owe friend
    @com.fasterxml.jackson.annotation.JsonProperty("iOweFriend")
    private boolean iOweFriend = false;
}
