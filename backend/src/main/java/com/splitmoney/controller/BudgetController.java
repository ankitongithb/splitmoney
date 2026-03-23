package com.splitmoney.controller;

import com.splitmoney.dto.*;
import com.splitmoney.model.*;
import com.splitmoney.service.AuthService;
import com.splitmoney.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Budget>>> getBudgets(
            @AuthenticationPrincipal UserDetails details) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success(budgetService.getUserBudgets(user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Budget>> setBudget(
            @AuthenticationPrincipal UserDetails details,
            @Valid @RequestBody BudgetRequest request) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Budget set", budgetService.setBudget(user, request)));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStatus(
            @AuthenticationPrincipal UserDetails details,
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) {
        User user = authService.getCurrentUser(details.getUsername());
        if (month == 0) month = LocalDate.now().getMonthValue();
        if (year == 0) year = LocalDate.now().getYear();
        return ResponseEntity.ok(ApiResponse.success(budgetService.getBudgetStatus(user, month, year)));
    }
}
