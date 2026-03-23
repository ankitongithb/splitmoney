package com.splitmoney.repository;

import com.splitmoney.model.Payment;
import com.splitmoney.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p WHERE p.sender = :user OR p.receiver = :user ORDER BY p.createdAt DESC")
    List<Payment> findAllByUser(@Param("user") User user);

    List<Payment> findTop10BySenderOrReceiverOrderByCreatedAtDesc(User sender, User receiver);
}
