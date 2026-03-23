package com.splitmoney.service;

import com.splitmoney.dto.*;
import com.splitmoney.model.User;
import com.splitmoney.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExpenseRepository expenseRepository;
    private final WalletRepository walletRepository;
    private final ExpenseService expenseService;
    private final FriendService friendService;

    public DashboardResponse getDashboard(User user) {
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();

        // This month total
        BigDecimal thisMonth = Optional.ofNullable(
                expenseRepository.getTotalByUserMonthYear(user, currentMonth, currentYear))
                .orElse(BigDecimal.ZERO);

        // Last month total
        LocalDate lastMonthDate = now.minusMonths(1);
        BigDecimal lastMonth = Optional.ofNullable(
                expenseRepository.getTotalByUserMonthYear(user, lastMonthDate.getMonthValue(), lastMonthDate.getYear()))
                .orElse(BigDecimal.ZERO);

        // Wallet balance
        BigDecimal walletBalance = walletRepository.findByUser(user)
                .map(w -> w.getBalance())
                .orElse(BigDecimal.ZERO);

        // Category breakdown
        List<Object[]> cats = expenseRepository.getCategoryBreakdown(user, currentMonth, currentYear);
        Map<String, BigDecimal> categoryBreakdown = new LinkedHashMap<>();
        for (Object[] row : cats) {
            categoryBreakdown.put((String) row[0], (BigDecimal) row[1]);
        }

        // Monthly data (last 6 months)
        LocalDate sixMonthsAgo = now.minusMonths(5).withDayOfMonth(1);
        List<Object[]> monthly = expenseRepository.getMonthlyTotals(user, sixMonthsAgo);
        List<DashboardResponse.MonthlyData> monthlyData = new ArrayList<>();
        for (Object[] row : monthly) {
            int m = ((Number) row[0]).intValue();
            int y = ((Number) row[1]).intValue();
            BigDecimal amt = (BigDecimal) row[2];
            String label = Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + y;
            monthlyData.add(DashboardResponse.MonthlyData.builder().month(label).amount(amt).build());
        }

        // Recent expenses
        List<ExpenseResponse> recent = expenseRepository.findTop5ByUserOrderByCreatedAtDesc(user)
                .stream().map(expenseService::toResponse).collect(java.util.stream.Collectors.toList());

        // Friend balances
        List<BalanceResponse> friendBalances = friendService.getFriendBalances(user);
        BigDecimal totalOwed = friendBalances.stream()
                .filter(b -> b.getBalance().compareTo(BigDecimal.ZERO) > 0)
                .map(BalanceResponse::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalOwe = friendBalances.stream()
                .filter(b -> b.getBalance().compareTo(BigDecimal.ZERO) < 0)
                .map(b -> b.getBalance().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return DashboardResponse.builder()
                .totalExpensesThisMonth(thisMonth)
                .totalExpensesLastMonth(lastMonth)
                .walletBalance(walletBalance)
                .totalOwed(totalOwed)
                .totalOwe(totalOwe)
                .categoryBreakdown(categoryBreakdown)
                .monthlyData(monthlyData)
                .recentExpenses(recent)
                .friendBalances(friendBalances)
                .build();
    }
}
