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

    // ── CRUD ─────────────────────────────────────────────────────────────────

    public List<Notification> getAllNotifications(Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getLatestNotifications(Long userId) {
        return notificationRepo.findTop5ByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepo.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(Long notificationId, Long userId) {
        notificationRepo.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId)) {
                n.setRead(true);
                notificationRepo.save(n);
            }
        });
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepo.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepo.saveAll(unread);
    }

    // ── Internal create helper ────────────────────────────────────────────────
    private void createIfNotExists(String title, String message,
                                   NotificationType type, Long referenceId, Long userId) {
        if (!notificationRepo.existsByUserIdAndReferenceIdAndType(userId, referenceId, type)) {
            Notification n = new Notification();
            n.setTitle(title);
            n.setMessage(message);
            n.setType(type);
            n.setReferenceId(referenceId);
            n.setUserId(userId);
            notificationRepo.save(n);
        }
    }

    // ── Notification generators ───────────────────────────────────────────────

    public void generateContributionNotification(Goals goal, Long userId) {
        String title   = "Contribution Due 🔔";
        String message = "Time to contribute Ksh "
                + goal.getContributionAmount().toPlainString()
                + " towards " + goal.getGoalName();
        createIfNotExists(title, message, NotificationType.CONTRIBUTION, goal.getGoalId(), userId);
    }

    public void generateBudgetExceededNotification(Long budgetId, String category, Long userId) {
        String title   = "Budget Exceeded ⚠️";
        String message = "Your " + category + " budget has been exceeded this month.";
        createIfNotExists(title, message, NotificationType.BUDGET_EXCEEDED, budgetId, userId);
    }

    public void generateGoalMilestoneNotification(Goals goal, int milestone, Long userId) {
        String emoji   = milestone == 100 ? "🏆" : "🎯";
        String title   = "Goal Milestone " + emoji;
        String message = goal.getGoalName() + " is " + milestone + "% complete!";
        Long uniqueRef = goal.getGoalId() * 100L + milestone;
        createIfNotExists(title, message, NotificationType.GOAL_MILESTONE, uniqueRef, userId);
    }

    // ── Master check — scoped to a specific user ──────────────────────────────
    public void runNotificationCheck(Long userId) {
        // ── Goals ──
        goalsRepo.findByUserId(userId).forEach(goal -> {
            if (goal.getStatus() == null) return;

            // Contribution due
            if ("ACTIVE".equals(goal.getStatus().name())) {
                var nextDate = goalsService.getNextContributionDate(goal);
                if (nextDate != null && !nextDate.isAfter(java.time.LocalDate.now())) {
                    generateContributionNotification(goal, userId);
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
                        generateGoalMilestoneNotification(goal, milestone, userId);
                    }
                }
            }
        });

        // ── Budgets ──
        budgetManagerRepo.findByUserId(userId).forEach(budget -> {
            if (budget.getAmountSpent() != null && budget.getBudgetLimit() != null
                    && budget.getAmountSpent().compareTo(budget.getBudgetLimit()) > 0) {
                generateBudgetExceededNotification(
                        budget.getBudgetId(), budget.getCategory(), userId);
            }
        });
    }
}