package com.splitmoney.controller;

import com.splitmoney.dto.*;
import com.splitmoney.model.*;
import com.splitmoney.service.AuthService;
import com.splitmoney.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<Wallet>> getWallet(
            @AuthenticationPrincipal UserDetails details) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success(walletService.getWallet(user)));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Wallet>> addMoney(
            @AuthenticationPrincipal UserDetails details,
            @Valid @RequestBody WalletRequest request) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Money added to wallet", walletService.addMoney(user, request)));
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendMoney(
            @AuthenticationPrincipal UserDetails details,
            @Valid @RequestBody WalletRequest request) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Money sent successfully", walletService.sendMoney(user, request)));
    }
}
