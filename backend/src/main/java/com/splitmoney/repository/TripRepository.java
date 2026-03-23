package com.splitmoney.repository;

import com.splitmoney.model.Trip;
import com.splitmoney.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {

    @Query("SELECT DISTINCT t FROM Trip t LEFT JOIN TripMember tm ON tm.trip = t WHERE t.createdBy = :user OR tm.user = :user ORDER BY t.createdAt DESC")
    List<Trip> findAllByUserOrMember(@Param("user") User user);
}
