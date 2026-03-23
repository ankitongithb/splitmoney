package com.splitmoney.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class BalanceResponse {
    private Long friendId;
    private String friendName;
    private String friendEmail;
    private BigDecimal balance; // positive = friend owes me, negative = I owe friend
}
