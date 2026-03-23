package com.splitmoney.controller;

import com.splitmoney.dto.*;
import com.splitmoney.model.*;
import com.splitmoney.service.AuthService;
import com.splitmoney.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Trip>>> getTrips(
            @AuthenticationPrincipal UserDetails details) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success(tripService.getUserTrips(user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Trip>> createTrip(
            @AuthenticationPrincipal UserDetails details,
            @Valid @RequestBody TripRequest request) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Trip created", tripService.createTrip(user, request)));
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<ApiResponse<Trip>> getTrip(@PathVariable Long tripId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.getTrip(tripId)));
    }

    @GetMapping("/{tripId}/members")
    public ResponseEntity<ApiResponse<List<TripMember>>> getMembers(@PathVariable Long tripId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.getTripMembers(tripId)));
    }

    @GetMapping("/{tripId}/expenses")
    public ResponseEntity<ApiResponse<List<TripExpense>>> getExpenses(@PathVariable Long tripId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.getTripExpenses(tripId)));
    }

    @PostMapping("/{tripId}/expenses")
    public ResponseEntity<ApiResponse<TripExpense>> addExpense(
            @AuthenticationPrincipal UserDetails details,
            @PathVariable Long tripId,
            @Valid @RequestBody TripExpenseRequest request) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Expense added", tripService.addExpense(user, tripId, request)));
    }

    @GetMapping("/{tripId}/balances")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBalances(@PathVariable Long tripId) {
        return ResponseEntity.ok(ApiResponse.success(tripService.getTripBalances(tripId)));
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<ApiResponse<Void>> deleteTrip(
            @AuthenticationPrincipal UserDetails details,
            @PathVariable Long tripId) {
        User user = authService.getCurrentUser(details.getUsername());
        tripService.deleteTrip(user, tripId);
        return ResponseEntity.ok(ApiResponse.success("Trip deleted successfully", null));
    }

    @PostMapping("/{tripId}/members/{memberId}")
    public ResponseEntity<ApiResponse<TripMember>> addMember(
            @AuthenticationPrincipal UserDetails details,
            @PathVariable Long tripId,
            @PathVariable Long memberId) {
        User user = authService.getCurrentUser(details.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Member added", tripService.addMemberToTrip(user, tripId, memberId)));
    }
}
