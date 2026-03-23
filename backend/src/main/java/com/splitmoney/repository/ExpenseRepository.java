package com.splitmoney.repository;

import com.splitmoney.model.Expense;
import com.splitmoney.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserOrderByExpenseDateDesc(User user);

    @Query("SELECT e FROM Expense e WHERE e.user = :user AND MONTH(e.expenseDate) = :month AND YEAR(e.expenseDate) = :year ORDER BY e.expenseDate DESC")
    List<Expense> findByUserAndMonthYear(@Param("user") User user, @Param("month") int month, @Param("year") int year);

    @Query("SELECT e.category, SUM(e.amountInr) FROM Expense e WHERE e.user = :user AND MONTH(e.expenseDate) = :month AND YEAR(e.expenseDate) = :year GROUP BY e.category")
    List<Object[]> getCategoryBreakdown(@Param("user") User user, @Param("month") int month, @Param("year") int year);

    @Query("SELECT MONTH(e.expenseDate), YEAR(e.expenseDate), SUM(e.amountInr) FROM Expense e WHERE e.user = :user AND e.expenseDate >= :fromDate GROUP BY YEAR(e.expenseDate), MONTH(e.expenseDate) ORDER BY YEAR(e.expenseDate), MONTH(e.expenseDate)")
    List<Object[]> getMonthlyTotals(@Param("user") User user, @Param("fromDate") LocalDate fromDate);

    @Query("SELECT SUM(e.amountInr) FROM Expense e WHERE e.user = :user AND MONTH(e.expenseDate) = :month AND YEAR(e.expenseDate) = :year AND e.category = :category")
    BigDecimal getTotalByUserCategoryMonthYear(@Param("user") User user, @Param("category") String category, @Param("month") int month, @Param("year") int year);

    @Query("SELECT SUM(e.amountInr) FROM Expense e WHERE e.user = :user AND MONTH(e.expenseDate) = :month AND YEAR(e.expenseDate) = :year")
    BigDecimal getTotalByUserMonthYear(@Param("user") User user, @Param("month") int month, @Param("year") int year);

    List<Expense> findTop5ByUserOrderByCreatedAtDesc(User user);
}
