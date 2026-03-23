package com.splitmoney.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardResponse {
    private BigDecimal totalExpensesThisMonth;
    private BigDecimal totalExpensesLastMonth;
    private BigDecimal walletBalance;
    private BigDecimal totalOwed;     // others owe me
    private BigDecimal totalOwe;      // I owe others
    private Map<String, BigDecimal> categoryBreakdown;
    private List<MonthlyData> monthlyData;
    private List<ExpenseResponse> recentExpenses;
    private List<BalanceResponse> friendBalances;

    @Data
    @Builder
    public static class MonthlyData {
        private String month;
        private BigDecimal amount;
    }
}
