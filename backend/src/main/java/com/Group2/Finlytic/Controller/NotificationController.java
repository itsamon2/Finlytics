package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.Notification;
import com.Group2.Finlytic.Service.CustomUserDetails;
import com.Group2.Finlytic.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // ── Run check + get all (NotificationsPage) ───────────────────────────────
    @GetMapping
    public List<Notification> getAllNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.runNotificationCheck(userDetails.getUserId());
        return notificationService.getAllNotifications(userDetails.getUserId());
    }

    // ── Run check + get latest 5 (bell dropdown) ──────────────────────────────
    @GetMapping("/latest")
    public List<Notification> getLatestNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.runNotificationCheck(userDetails.getUserId());
        return notificationService.getLatestNotifications(userDetails.getUserId());
    }

    // ── Unread count ──────────────────────────────────────────────────────────
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        long count = notificationService.getUnreadCount(userDetails.getUserId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    // ── Mark single as read ───────────────────────────────────────────────────
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAsRead(id, userDetails.getUserId());
        return ResponseEntity.ok().build();
    }

    // ── Mark all as read ──────────────────────────────────────────────────────
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getUserId());
        return ResponseEntity.ok().build();
    }
}