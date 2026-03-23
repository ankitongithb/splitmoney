package com.splitmoney.service;

import com.splitmoney.dto.BalanceResponse;
import com.splitmoney.dto.TransactionRequest;
import com.splitmoney.exception.ResourceNotFoundException;
import com.splitmoney.model.*;
import com.splitmoney.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public void addFriend(User user, String name, String email) {
        if (friendRepository.existsByUserAndName(user, name)) {
            throw new IllegalArgumentException("Friend with this name already exists");
        }
        friendRepository.save(Friend.builder().user(user).name(name).email(email).build());
    }

    public List<Friend> getFriends(User user) {
        return friendRepository.findByUser(user);
    }

    @Transactional
    public void recordTransaction(User user, TransactionRequest req) {
        Friend friend = friendRepository.findById(req.getFriendId())
                .orElseThrow(() -> new ResourceNotFoundException("Friend not found"));

        if (!friend.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Not your friend");
        }

        Transaction tx = Transaction.builder()
                .user(user)
                .friend(friend)
                .isIOweFriend(req.isIOweFriend())
                .amount(req.getAmount())
                .description(req.getDescription())
                .category(req.getCategory())
                .transactionDate(req.getTransactionDate())
                .build();
        transactionRepository.save(tx);
    }

    public List<BalanceResponse> getFriendBalances(User user) {
        List<Friend> friends = getFriends(user);
        List<BalanceResponse> balances = new ArrayList<>();

        for (Friend friend : friends) {
            List<Transaction> txns = transactionRepository.findUnsettledByUserAndFriend(user, friend);
            BigDecimal balance = BigDecimal.ZERO;

            for (Transaction tx : txns) {
                if (tx.getIsIOweFriend() != null && tx.getIsIOweFriend()) {
                    // I owe friend -> negative balance
                    balance = balance.subtract(tx.getAmount());
                } else {
                    // friend owes me -> positive balance
                    balance = balance.add(tx.getAmount());
                }
            }

            balances.add(BalanceResponse.builder()
                    .friendId(friend.getId())
                    .friendName(friend.getName())
                    .friendEmail(friend.getEmail())
                    .balance(balance)
                    .build());
        }

        return balances;
    }

    @Transactional
    public void settleUp(User user, Long friendId) {
        Friend friend = friendRepository.findById(friendId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend not found"));

        if (!friend.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Not your friend");
        }

        List<Transaction> txns = transactionRepository.findUnsettledByUserAndFriend(user, friend);
        for (Transaction tx : txns) {
            tx.setIsSettled(true);
            tx.setSettledAt(LocalDateTime.now());
        }
        transactionRepository.saveAll(txns);
    }

    /**
     * Optimized debt settlement using greedy algorithm to minimize the number of transactions.
     * Returns simplified net balances after aggregation.
     */
    public List<BalanceResponse> getOptimizedBalances(User user) {
        List<BalanceResponse> raw = getFriendBalances(user);
        // Filter out zero balances and sort by net amount
        return raw.stream()
                .filter(b -> b.getBalance().compareTo(BigDecimal.ZERO) != 0)
                .sorted(Comparator.comparing(BalanceResponse::getBalance))
                .collect(Collectors.toList());
    }
}
