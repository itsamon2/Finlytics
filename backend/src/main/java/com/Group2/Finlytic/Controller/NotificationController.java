package com.Group2.Finlytic.Controller;

import com.Group2.Finlytic.Model.Notification;
import com.Group2.Finlytic.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // ── Run check + return all notifications (called on app load) ────────────
    // This single endpoint does both — runs the scan then returns results
    // so the frontend only needs one call on load
    @GetMapping
    public List<Notification> getAllNotifications() {
        notificationService.runNotificationCheck();
        return notificationService.getAllNotifications();
    }

    // ── Latest 5 for the bell dropdown ───────────────────────────────────────
    @GetMapping("/latest")
    public List<Notification> getLatestNotifications() {
        notificationService.runNotificationCheck();
        return notificationService.getLatestNotifications();
    }

    // ── Unread count for the badge ───────────────────────────────────────────
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(Map.of("count", count));
    }

    // ── Mark single notification as read ─────────────────────────────────────
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // ── Mark all as read ─────────────────────────────────────────────────────
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }
}