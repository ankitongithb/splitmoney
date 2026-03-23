package com.splitmoney.controller;

import com.splitmoney.dto.*;
import com.splitmoney.model.*;
import com.splitmoney.service.AuthService;
import com.splitmoney.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Payment>>> getPayments(
            @AuthenticationPrincipal UserDetails details) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success(paymentService.getUserPayments(user)));
    }

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(
            @AuthenticationPrincipal UserDetails details,
            @Valid @RequestBody PaymentRequest request) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Order created", paymentService.createPaymentOrder(user, request)));
    }

    @PostMapping("/{paymentId}/verify")
    public ResponseEntity<ApiResponse<Payment>> verify(
            @AuthenticationPrincipal UserDetails details,
            @PathVariable Long paymentId,
            @RequestBody Map<String, String> body) {
        User user = authService.getCurrentUser(details.getUsername());
        Payment payment = paymentService.verifyAndComplete(user, paymentId, body.get("razorpayPaymentId"));
        return ResponseEntity.ok(ApiResponse.success("Payment verified", payment));
    }
}
