package com.splitmoney.repository;

import com.splitmoney.model.Trip;
import com.splitmoney.model.TripMember;
import com.splitmoney.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TripMemberRepository extends JpaRepository<TripMember, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user"})
    List<TripMember> findByTrip(Trip trip);
    Optional<TripMember> findByTripAndUser(Trip trip, User user);
    boolean existsByTripAndUser(Trip trip, User user);
}
