package com.splitmoney.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "friend_id", nullable = false)
    private Friend friend;

    @Column(name = "is_i_owe_friend", nullable = false)
    @Builder.Default
    private Boolean isIOweFriend = false;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 300)
    private String description;

    @Column(length = 50)
    @Builder.Default
    private String category = "Others";

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "is_settled")
    @Builder.Default
    private Boolean isSettled = false;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
