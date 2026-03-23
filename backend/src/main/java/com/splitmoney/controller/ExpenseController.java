package com.splitmoney.controller;

import com.splitmoney.dto.*;
import com.splitmoney.model.User;
import com.splitmoney.service.AuthService;
import com.splitmoney.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getAll(
            @AuthenticationPrincipal UserDetails details) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success(expenseService.getUserExpenses(user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> create(
            @AuthenticationPrincipal UserDetails details,
            @Valid @RequestBody ExpenseRequest request) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Expense added", expenseService.addExpense(user, request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> update(
            @AuthenticationPrincipal UserDetails details,
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Expense updated", expenseService.updateExpense(user, id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails details,
            @PathVariable Long id) {
        User user = authService.getCurrentUser(details.getUsername());
        expenseService.deleteExpense(user, id);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted", null));
    }

    @GetMapping("/rates")
    public ResponseEntity<ApiResponse<Map<String, java.math.BigDecimal>>> getRates() {
        return ResponseEntity.ok(ApiResponse.success(expenseService.getExchangeRates()));
    }
}
