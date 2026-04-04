package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Long> {

    // All notifications newest first
    List<Notification> findAllByOrderByCreatedAtDesc();

    // Latest N for the bell dropdown
    List<Notification> findTop5ByOrderByCreatedAtDesc();

    // Unread count for the badge
    long countByReadFalse();

    // Check if a notification already exists for this reference
    // prevents duplicate notifications for the same goal/budget event
    boolean existsByReferenceIdAndType(Long referenceId,
                                       com.Group2.Finlytic.Model.NotificationType type);
}