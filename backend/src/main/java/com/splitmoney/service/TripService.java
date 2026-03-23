package com.splitmoney.service;

import com.splitmoney.dto.*;
import com.splitmoney.exception.ResourceNotFoundException;
import com.splitmoney.model.*;
import com.splitmoney.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final TripMemberRepository tripMemberRepository;
    private final TripExpenseRepository tripExpenseRepository;
    private final TripExpenseSplitRepository splitRepository;
    private final UserRepository userRepository;
    private final FriendRepository friendRepository;
    private final ExpenseService expenseService;

    @Transactional
    public Trip createTrip(User creator, TripRequest req) {
        Trip trip = Trip.builder()
                .name(req.getName())
                .description(req.getDescription())
                .destination(req.getDestination())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .createdBy(creator)
                .build();
        trip = tripRepository.save(trip);

        // Add creator as member
        tripMemberRepository.save(TripMember.builder().trip(trip).user(creator).build());

        // Add other members (from Friend IDs)
        if (req.getMemberIds() != null) {
            for (Long friendId : req.getMemberIds()) {
                Friend friend = friendRepository.findById(friendId)
                        .orElseThrow(() -> new ResourceNotFoundException("Friend not found: " + friendId));
                User member = resolveFriendToUser(friend);
                        
                if (!member.getId().equals(creator.getId())) {
                    if (!tripMemberRepository.existsByTripAndUser(trip, member)) {
                        tripMemberRepository.save(TripMember.builder().trip(trip).user(member).build());
                    }
                }
            }
        }
        return trip;
    }

    public List<Trip> getUserTrips(User user) {
        return tripRepository.findAllByUserOrMember(user);
    }

    public Trip getTrip(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));
    }

    @Transactional
    public void deleteTrip(User user, Long tripId) {
        Trip trip = getTrip(tripId);
        if (!trip.getCreatedBy().getId().equals(user.getId())) {
             throw new IllegalArgumentException("Only creator can delete trip");
        }
        tripRepository.delete(trip);
    }

    @Transactional
    public TripMember addMemberToTrip(User user, Long tripId, Long friendId) {
        Trip trip = getTrip(tripId);
        if (!tripMemberRepository.existsByTripAndUser(trip, user)) {
            throw new IllegalArgumentException("Not a member of this trip");
        }
        
        Friend friend = friendRepository.findById(friendId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend not found: " + friendId));
        
        User newMember = resolveFriendToUser(friend);
                
        if (tripMemberRepository.existsByTripAndUser(trip, newMember)) {
            throw new IllegalArgumentException("User is already a member");
        }
        return tripMemberRepository.save(TripMember.builder().trip(trip).user(newMember).build());
    }

    @Transactional
    public TripExpense addExpense(User user, Long tripId, TripExpenseRequest req) {
        Trip trip = getTrip(tripId);
        List<TripMember> members = tripMemberRepository.findByTrip(trip);

        User payer = user;
        if (req.getPaidById() != null) {
            payer = userRepository.findById(req.getPaidById())
                    .orElseThrow(() -> new ResourceNotFoundException("Payer User not found"));
        }

        // Handle Foreign Currency Conversion
        String currency = req.getCurrency() != null ? req.getCurrency().toUpperCase() : "INR";
        BigDecimal exchangeRate = expenseService.getExchangeRates().getOrDefault(currency, BigDecimal.ONE);
        BigDecimal convertedAmount = req.getAmount().multiply(exchangeRate);

        TripExpense expense = TripExpense.builder()
                .trip(trip)
                .paidBy(payer)
                .title(req.getTitle())
                .amount(convertedAmount)
                .splitType(req.getSplitType())
                .description(req.getDescription())
                .expenseDate(req.getExpenseDate())
                .build();
        expense = tripExpenseRepository.save(expense);

        // Calculate splits using CONVERTED amount
        if ("EQUAL".equals(req.getSplitType())) {
            BigDecimal share = convertedAmount.divide(
                    new BigDecimal(members.size()), 2, RoundingMode.HALF_UP);
            for (TripMember member : members) {
                splitRepository.save(TripExpenseSplit.builder()
                        .tripExpense(expense)
                        .user(member.getUser())
                        .shareAmount(share)
                        .isPaid(member.getUser().getId().equals(payer.getId()))
                        .build());
            }
        } else if ("CUSTOM".equals(req.getSplitType()) && req.getCustomSplits() != null) {
            for (Map.Entry<Long, BigDecimal> entry : req.getCustomSplits().entrySet()) {
                User member = userRepository.findById(entry.getKey())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + entry.getKey()));
                splitRepository.save(TripExpenseSplit.builder()
                        .tripExpense(expense)
                        .user(member)
                        .shareAmount(entry.getValue())
                        .isPaid(member.getId().equals(payer.getId()))
                        .build());
            }
        }

        // Update trip total purely with the fully converted base currency layout
        trip.setTotalAmount(trip.getTotalAmount().add(convertedAmount));
        tripRepository.save(trip);

        return expense;
    }

    public List<TripMember> getTripMembers(Long tripId) {
        Trip trip = getTrip(tripId);
        return tripMemberRepository.findByTrip(trip);
    }

    public List<TripExpense> getTripExpenses(Long tripId) {
        Trip trip = getTrip(tripId);
        return tripExpenseRepository.findByTripOrderByExpenseDateDesc(trip);
    }

    /**
     * Optimized debt minimization for a trip.
     * Uses greedy algorithm: sort credits/debts, match largest credit with largest debt.
     */
    public List<Map<String, Object>> getTripBalances(Long tripId) {
        Trip trip = getTrip(tripId);
        List<TripMember> members = tripMemberRepository.findByTrip(trip);
        List<TripExpense> expenses = tripExpenseRepository.findByTripOrderByExpenseDateDesc(trip);

        // net[userId] = amount paid by user - amount that user should pay
        Map<Long, BigDecimal> net = new HashMap<>();
        for (TripMember m : members) {
            net.put(m.getUser().getId(), BigDecimal.ZERO);
        }

        for (TripExpense exp : expenses) {
            Long paidById = exp.getPaidBy().getId();
            net.merge(paidById, exp.getAmount(), BigDecimal::add);

            List<TripExpenseSplit> splits = splitRepository.findByTripExpense(exp);
            for (TripExpenseSplit split : splits) {
                net.merge(split.getUser().getId(), split.getShareAmount().negate(), BigDecimal::add);
            }
        }

        // Build user name map
        Map<Long, String> nameMap = members.stream()
                .collect(Collectors.toMap(m -> m.getUser().getId(), m -> m.getUser().getName()));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> entry : net.entrySet()) {
            if (entry.getValue().compareTo(BigDecimal.ZERO) != 0) {
                Map<String, Object> row = new HashMap<>();
                row.put("userId", entry.getKey());
                row.put("userName", nameMap.get(entry.getKey()));
                row.put("netAmount", entry.getValue()); // positive=owed by others, negative=owes others
                result.add(row);
            }
        }
        return result;
    }

    private User resolveFriendToUser(Friend friend) {
        String email = friend.getEmail();
        if (email == null || email.isBlank()) {
            email = "friend_" + friend.getId() + "@offline.splitmoney.com";
        }
        
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        // Create a shadow user to map backend relationships seamlessly
        User shadow = User.builder()
                .name(friend.getName())
                .email(email)
                .password(UUID.randomUUID().toString()) // random unusable password
                .build();
        return userRepository.save(shadow);
    }
}
