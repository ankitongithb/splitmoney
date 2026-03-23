package com.splitmoney.controller;

import com.splitmoney.dto.*;
import com.splitmoney.model.User;
import com.splitmoney.service.AuthService;
import com.splitmoney.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserDetails details) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboard(user)));
    }
}
