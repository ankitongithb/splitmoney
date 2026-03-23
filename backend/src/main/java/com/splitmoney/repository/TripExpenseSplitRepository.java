package com.splitmoney.repository;

import com.splitmoney.model.TripExpense;
import com.splitmoney.model.TripExpenseSplit;
import com.splitmoney.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripExpenseSplitRepository extends JpaRepository<TripExpenseSplit, Long> {
    List<TripExpenseSplit> findByTripExpense(TripExpense tripExpense);
    List<TripExpenseSplit> findByUser(User user);
}
