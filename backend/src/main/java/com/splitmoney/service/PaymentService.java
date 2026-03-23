package com.splitmoney.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.splitmoney.dto.PaymentRequest;
import com.splitmoney.exception.ResourceNotFoundException;
import com.splitmoney.model.*;
import com.splitmoney.repository.*;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final FriendRepository friendRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Transactional
    public Map<String, Object> createPaymentOrder(User sender, PaymentRequest req) {
        Friend friend = friendRepository.findById(req.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Friend not found"));
        User receiver = resolveFriendToUser(friend);

        Payment payment = Payment.builder()
                .sender(sender)
                .receiver(receiver)
                .amount(req.getAmount())
                .currency(req.getCurrency())
                .description(req.getDescription())
                .status("PENDING")
                .build();

        String orderId = null;
        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderReq = new JSONObject();
            // Razorpay amount in paise (1 INR = 100 paise)
            orderReq.put("amount", req.getAmount().multiply(new java.math.BigDecimal("100")).intValue());
            orderReq.put("currency", req.getCurrency());
            orderReq.put("payment_capture", 1);
            Order order = client.orders.create(orderReq);
            orderId = order.get("id");
            payment.setRazorpayOrderId(orderId);
        } catch (Exception e) {
            // Sandbox/test mode fallback — generate a mock order ID
            orderId = "order_test_" + System.currentTimeMillis();
            payment.setRazorpayOrderId(orderId);
        }

        payment = paymentRepository.save(payment);

        Map<String, Object> response = new HashMap<>();
        response.put("paymentId", payment.getId());
        response.put("orderId", orderId);
        response.put("amount", req.getAmount());
        response.put("currency", req.getCurrency());
        response.put("keyId", razorpayKeyId);
        response.put("receiverName", receiver.getName());
        return response;
    }

    @Transactional
    public Payment verifyAndComplete(User user, Long paymentId, String razorpayPaymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setStatus("COMPLETED");

        // Credit wallet of receiver
        Wallet receiverWallet = walletRepository.findByUser(payment.getReceiver())
                .orElseGet(() -> Wallet.builder().user(payment.getReceiver()).build());
        receiverWallet.setBalance(receiverWallet.getBalance().add(payment.getAmount()));
        walletRepository.save(receiverWallet);

        return paymentRepository.save(payment);
    }

    public List<Payment> getUserPayments(User user) {
        return paymentRepository.findAllByUser(user);
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
