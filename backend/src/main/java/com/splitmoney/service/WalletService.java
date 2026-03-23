package com.splitmoney.service;

import com.splitmoney.dto.WalletRequest;
import com.splitmoney.exception.ResourceNotFoundException;
import com.splitmoney.model.*;
import com.splitmoney.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.HashMap;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final FriendRepository friendRepository;

    public Wallet getWallet(User user) {
        return walletRepository.findByUser(user)
                .orElseGet(() -> {
                    Wallet w = Wallet.builder().user(user).build();
                    return walletRepository.save(w);
                });
    }

    @Transactional
    public Wallet addMoney(User user, WalletRequest req) {
        Wallet wallet = getWallet(user);
        wallet.setBalance(wallet.getBalance().add(req.getAmount()));
        return walletRepository.save(wallet);
    }

    @Transactional
    public Map<String, Object> sendMoney(User sender, WalletRequest req) {
        if (req.getReceiverId() == null) {
            throw new IllegalArgumentException("Receiver ID required");
        }
        
        Friend friend = friendRepository.findById(req.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Friend not found"));
        User receiver = resolveFriendToUser(friend);

        Wallet senderWallet = getWallet(sender);
        if (senderWallet.getBalance().compareTo(req.getAmount()) < 0) {
            throw new IllegalArgumentException("Insufficient wallet balance");
        }

        senderWallet.setBalance(senderWallet.getBalance().subtract(req.getAmount()));
        walletRepository.save(senderWallet);

        Wallet receiverWallet = getWallet(receiver);
        receiverWallet.setBalance(receiverWallet.getBalance().add(req.getAmount()));
        walletRepository.save(receiverWallet);

        Map<String, Object> result = new HashMap<>();
        result.put("senderBalance", senderWallet.getBalance());
        result.put("receiverName", receiver.getName());
        result.put("amount", req.getAmount());
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
        
        User shadow = User.builder()
                .name(friend.getName())
                .email(email)
                .password(UUID.randomUUID().toString())
                .build();
        return userRepository.save(shadow);
    }
}
