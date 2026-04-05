package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.Notification;
import com.Group2.Finlytic.Model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Long> {

    // All notifications for a user newest first
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Latest 5 for the bell dropdown
    List<Notification> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);

    // Unread count for the badge
    long countByUserIdAndReadFalse(Long userId);

    // Check if notification already exists for this user + reference + type
    boolean existsByUserIdAndReferenceIdAndType(Long userId, Long referenceId, NotificationType type);

    // All unread for mark all as read
    List<Notification> findByUserIdAndReadFalse(Long userId);
}