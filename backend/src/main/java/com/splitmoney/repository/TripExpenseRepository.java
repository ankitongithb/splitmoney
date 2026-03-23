package com.splitmoney.repository;

import com.splitmoney.model.TripExpense;
import com.splitmoney.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripExpenseRepository extends JpaRepository<TripExpense, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"paidBy"})
    List<TripExpense> findByTripOrderByExpenseDateDesc(Trip trip);
}
