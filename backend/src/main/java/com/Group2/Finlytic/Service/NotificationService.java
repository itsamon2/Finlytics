package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.Goals;
import com.Group2.Finlytic.Model.Notification;
import com.Group2.Finlytic.Model.NotificationType;
import com.Group2.Finlytic.repo.BudgetManagerRepo;
import com.Group2.Finlytic.repo.GoalsRepo;
import com.Group2.Finlytic.repo.NotificationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepo notificationRepo;

    @Autowired
    private GoalsRepo goalsRepo;

    @Autowired
    private BudgetManagerRepo budgetManagerRepo;

    @Autowired
    private GoalsService goalsService;

    // ── CRUD ────────────────────────────────────────────────────────────────

    // Get all notifications newest first (for NotificationsPage)
    public List<Notification> getAllNotifications() {
        return notificationRepo.findAllByOrderByCreatedAtDesc();
    }

    // Get latest 5 for the bell dropdown
    public List<Notification> getLatestNotifications() {
        return notificationRepo.findTop5ByOrderByCreatedAtDesc();
    }

    // Unread count for the badge
    public long getUnreadCount() {
        return notificationRepo.countByReadFalse();
    }

    // Mark a single notification as read
    public void markAsRead(Long notificationId) {
        notificationRepo.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepo.save(n);
        });
    }

    // Mark all notifications as read
    public void markAllAsRead() {
        List<Notification> unread = notificationRepo.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(n -> !n.isRead())
                .toList();
        unread.forEach(n -> n.setRead(true));
        notificationRepo.saveAll(unread);
    }

    // ── Internal create helper ───────────────────────────────────────────────
    private void createIfNotExists(String title, String message,
                                   NotificationType type, Long referenceId) {
        // Avoid duplicate notifications for the same event
        if (!notificationRepo.existsByReferenceIdAndType(referenceId, type)) {
            Notification n = new Notification();
            n.setTitle(title);
            n.setMessage(message);
            n.setType(type);
            n.setReferenceId(referenceId);
            notificationRepo.save(n);
        }
    }

    // ── Notification generators ──────────────────────────────────────────────

    // Called when a contribution is due for a goal
    public void generateContributionNotification(Goals goal) {
        String title   = "Contribution Due 🔔";
        String message = "Time to contribute Ksh "
                + goal.getContributionAmount().toPlainString()
                + " towards " + goal.getGoalName();
        // Use a composite key concept — we clear this when contribution is recorded
        // so we store referenceId as goalId, type as CONTRIBUTION
        createIfNotExists(title, message, NotificationType.CONTRIBUTION, goal.getGoalId());
    }

    // Called when a budget is exceeded
    public void generateBudgetExceededNotification(Long budgetId, String category) {
        String title   = "Budget Exceeded ⚠️";
        String message = "Your " + category + " budget has been exceeded this month.";
        createIfNotExists(title, message, NotificationType.BUDGET_EXCEEDED, budgetId);
    }

    // Called when a goal hits a milestone — 25, 50, 75, 100%
    public void generateGoalMilestoneNotification(Goals goal, int milestone) {
        String emoji = milestone == 100 ? "🏆" : "🎯";
        String title = "Goal Milestone " + emoji;
        String message = goal.getGoalName() + " is " + milestone + "% complete!";
        // Use referenceId as goalId * 100 + milestone to make it unique per milestone
        Long uniqueRef = goal.getGoalId() * 100L + milestone;
        createIfNotExists(title, message, NotificationType.GOAL_MILESTONE, uniqueRef);
    }

    // ── Master check — call this on page load ────────────────────────────────
    // Scans all goals and budgets and generates any missing notifications
    public void runNotificationCheck() {
        // ── Goals ──
        goalsRepo.findAll().forEach(goal -> {
            if (goal.getStatus() == null) return;

            // Contribution due
            if ("ACTIVE".equals(goal.getStatus().name())) {
                var nextDate = goalsService.getNextContributionDate(goal);
                if (nextDate != null && !nextDate.isAfter(java.time.LocalDate.now())) {
                    generateContributionNotification(goal);
                }
            }

            // Goal milestones
            if (goal.getTargetAmount() != null && goal.getSavedAmount() != null
                    && goal.getTargetAmount().compareTo(java.math.BigDecimal.ZERO) > 0) {

                double progress = goal.getSavedAmount()
                        .divide(goal.getTargetAmount(), 4, java.math.RoundingMode.HALF_UP)
                        .multiply(java.math.BigDecimal.valueOf(100))
                        .doubleValue();

                for (int milestone : new int[]{25, 50, 75, 100}) {
                    if (progress >= milestone) {
                        generateGoalMilestoneNotification(goal, milestone);
                    }
                }
            }
        });

        // ── Budgets ──
        budgetManagerRepo.findAll().forEach(budget -> {
            if (budget.getAmountSpent() != null && budget.getBudgetLimit() != null
                    && budget.getAmountSpent().compareTo(budget.getBudgetLimit()) > 0) {
                generateBudgetExceededNotification(budget.getBudgetId(), budget.getCategory());
            }
        });
    }
}