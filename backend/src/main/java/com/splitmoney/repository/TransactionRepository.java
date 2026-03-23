package com.splitmoney.repository;

import com.splitmoney.model.Friend;
import com.splitmoney.model.Transaction;
import com.splitmoney.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.isSettled = false ORDER BY t.transactionDate DESC")
    List<Transaction> findUnsettledByUser(@Param("user") User user);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user ORDER BY t.transactionDate DESC")
    List<Transaction> findAllByUser(@Param("user") User user);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.friend = :friend AND t.isSettled = false")
    List<Transaction> findUnsettledByUserAndFriend(@Param("user") User user, @Param("friend") Friend friend);
}
