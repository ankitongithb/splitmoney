package com.splitmoney.service;

import com.splitmoney.dto.ExpenseRequest;
import com.splitmoney.dto.ExpenseResponse;
import com.splitmoney.exception.ResourceNotFoundException;
import com.splitmoney.exception.UnauthorizedException;
import com.splitmoney.model.Expense;
import com.splitmoney.model.User;
import com.splitmoney.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    // Fixed exchange rates to INR (in production, call a live API)
    private static final Map<String, BigDecimal> EXCHANGE_RATES = new HashMap<>();
    static {
        EXCHANGE_RATES.put("INR", BigDecimal.ONE);
        EXCHANGE_RATES.put("USD", new BigDecimal("83.00"));
        EXCHANGE_RATES.put("EUR", new BigDecimal("90.00"));
        EXCHANGE_RATES.put("GBP", new BigDecimal("105.00"));
        EXCHANGE_RATES.put("JPY", new BigDecimal("0.56"));
        EXCHANGE_RATES.put("AUD", new BigDecimal("54.00"));
        EXCHANGE_RATES.put("CAD", new BigDecimal("61.00"));
        EXCHANGE_RATES.put("SGD", new BigDecimal("62.00"));
        EXCHANGE_RATES.put("AED", new BigDecimal("22.60"));
    }

    @Transactional
    public ExpenseResponse addExpense(User user, ExpenseRequest req) {
        BigDecimal rate = EXCHANGE_RATES.getOrDefault(req.getCurrency().toUpperCase(), BigDecimal.ONE);
        BigDecimal amountInr = req.getAmount().multiply(rate);

        Expense expense = Expense.builder()
                .user(user)
                .title(req.getTitle())
                .amount(req.getAmount())
                .currency(req.getCurrency().toUpperCase())
                .amountInr(amountInr)
                .category(req.getCategory())
                .description(req.getDescription())
                .expenseDate(req.getExpenseDate())
                .build();

        return toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse updateExpense(User user, Long expenseId, ExpenseRequest req) {
        Expense expense = getExpenseById(expenseId);
        if (!expense.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You don't own this expense");
        }

        BigDecimal rate = EXCHANGE_RATES.getOrDefault(req.getCurrency().toUpperCase(), BigDecimal.ONE);
        expense.setTitle(req.getTitle());
        expense.setAmount(req.getAmount());
        expense.setCurrency(req.getCurrency().toUpperCase());
        expense.setAmountInr(req.getAmount().multiply(rate));
        expense.setCategory(req.getCategory());
        expense.setDescription(req.getDescription());
        expense.setExpenseDate(req.getExpenseDate());

        return toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public void deleteExpense(User user, Long expenseId) {
        Expense expense = getExpenseById(expenseId);
        if (!expense.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You don't own this expense");
        }
        expenseRepository.delete(expense);
    }

    public List<ExpenseResponse> getUserExpenses(User user) {
        return expenseRepository.findByUserOrderByExpenseDateDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found: " + id));
    }

    public Map<String, BigDecimal> getExchangeRates() {
        return EXCHANGE_RATES;
    }

    public ExpenseResponse toResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId())
                .userId(e.getUser().getId())
                .userName(e.getUser().getName())
                .title(e.getTitle())
                .amount(e.getAmount())
                .currency(e.getCurrency())
                .amountInr(e.getAmountInr())
                .category(e.getCategory())
                .description(e.getDescription())
                .expenseDate(e.getExpenseDate())
                .receiptUrl(e.getReceiptUrl())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
