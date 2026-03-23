package com.splitmoney.repository;

import com.splitmoney.model.Friend;
import com.splitmoney.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface FriendRepository extends JpaRepository<Friend, Long> {

    List<Friend> findByUser(User user);

    @Query("SELECT f FROM Friend f WHERE f.user = :user AND f.name = :name")
    Optional<Friend> findFriendship(@Param("user") User user, @Param("name") String name);

    boolean existsByUserAndName(User user, String name);
}
