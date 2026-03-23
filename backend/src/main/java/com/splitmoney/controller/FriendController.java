package com.splitmoney.controller;

import com.splitmoney.dto.*;
import com.splitmoney.model.User;
import com.splitmoney.service.AuthService;
import com.splitmoney.service.FriendService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<com.splitmoney.model.Friend>>> getFriends(
            @AuthenticationPrincipal UserDetails details) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success(friendService.getFriends(user)));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Void>> addFriend(
            @AuthenticationPrincipal UserDetails details,
            @RequestBody Map<String, String> body) {
        User user = authService.getCurrentUser(details.getUsername());
        friendService.addFriend(user, body.get("name"), body.get("email"));
        return ResponseEntity.ok(ApiResponse.success("Friend added", null));
    }

    @PostMapping("/transaction")
    public ResponseEntity<ApiResponse<Void>> recordTransaction(
            @AuthenticationPrincipal UserDetails details,
            @Valid @RequestBody TransactionRequest request) {
        User user = authService.getCurrentUser(details.getUsername());
        friendService.recordTransaction(user, request);
        return ResponseEntity.ok(ApiResponse.success("Transaction recorded", null));
    }

    @GetMapping("/balances")
    public ResponseEntity<ApiResponse<List<BalanceResponse>>> getBalances(
            @AuthenticationPrincipal UserDetails details) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success(friendService.getFriendBalances(user)));
    }

    @GetMapping("/balances/optimized")
    public ResponseEntity<ApiResponse<List<BalanceResponse>>> getOptimizedBalances(
            @AuthenticationPrincipal UserDetails details) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success(friendService.getOptimizedBalances(user)));
    }

    @PostMapping("/settle/{friendId}")
    public ResponseEntity<ApiResponse<Void>> settleUp(
            @AuthenticationPrincipal UserDetails details,
            @PathVariable Long friendId) {
        User user = authService.getCurrentUser(details.getUsername());
        friendService.settleUp(user, friendId);
        return ResponseEntity.ok(ApiResponse.success("Settled up successfully", null));
    }
}
