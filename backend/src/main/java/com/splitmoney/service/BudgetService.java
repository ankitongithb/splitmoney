package com.splitmoney.service;

import com.splitmoney.dto.BudgetRequest;
import com.splitmoney.model.Budget;
import com.splitmoney.model.User;
import com.splitmoney.repository.BudgetRepository;
import com.splitmoney.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;

    @Transactional
    public Budget setBudget(User user, BudgetRequest req) {
        Optional<Budget> existing = budgetRepository.findByUserAndCategoryAndMonthAndYear(
                user, req.getCategory(), req.getMonth(), req.getYear());

        Budget budget = existing.orElse(Budget.builder().user(user).build());
        budget.setCategory(req.getCategory());
        budget.setAmount(req.getAmount());
        budget.setMonth(req.getMonth());
        budget.setYear(req.getYear());

        return budgetRepository.save(budget);
    }

    public List<Map<String, Object>> getBudgetStatus(User user, int month, int year) {
        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(user, month, year);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Budget b : budgets) {
            BigDecimal spent = Optional.ofNullable(
                    expenseRepository.getTotalByUserCategoryMonthYear(user, b.getCategory(), month, year))
                    .orElse(BigDecimal.ZERO);

            BigDecimal remaining = b.getAmount().subtract(spent);
            double percentage = b.getAmount().compareTo(BigDecimal.ZERO) == 0 ? 0
                    : spent.divide(b.getAmount(), 4, java.math.RoundingMode.HALF_UP)
                           .multiply(new BigDecimal("100")).doubleValue();

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("budgetId", b.getId());
            row.put("category", b.getCategory());
            row.put("budgetAmount", b.getAmount());
            row.put("spentAmount", spent);
            row.put("remaining", remaining);
            row.put("percentage", Math.min(percentage, 100));
            row.put("isOverspent", spent.compareTo(b.getAmount()) > 0);
            result.add(row);
        }

        return result;
    }

    public List<Budget> getUserBudgets(User user) {
        LocalDate now = LocalDate.now();
        return budgetRepository.findByUserAndMonthAndYear(user, now.getMonthValue(), now.getYear());
    }
}
