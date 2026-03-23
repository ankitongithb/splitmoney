package com.splitmoney.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "trip_expense_splits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripExpenseSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_expense_id", nullable = false)
    private TripExpense tripExpense;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "share_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal shareAmount;

    @Column(name = "is_paid")
    @Builder.Default
    private Boolean isPaid = false;
}
