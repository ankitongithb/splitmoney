package com.splitmoney.service;

import com.splitmoney.dto.*;
import com.splitmoney.exception.ResourceNotFoundException;
import com.splitmoney.model.User;
import com.splitmoney.model.Wallet;
import com.splitmoney.repository.UserRepository;
import com.splitmoney.repository.WalletRepository;
import com.splitmoney.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .currency("INR")
                .build();
        user = userRepository.save(user);

        // Create wallet for new user
        Wallet wallet = Wallet.builder().user(user).build();
        walletRepository.save(wallet);

        String token = jwtUtil.generateToken(user.getEmail());
        return buildAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String token = jwtUtil.generateToken(user.getEmail());
        return buildAuthResponse(user, token);
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .currency(user.getCurrency())
                .build();
    }
}
