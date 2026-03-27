package com.Group2.Finlytic.Model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "goals")
public class Goals {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "goal_id")
    private Long goalId;

    @Column(name = "goal_name")
    private String goalName;

    @Column(name = "goal_type")
    private String goalType;

    @Column(name = "target_amount")
    private BigDecimal targetAmount;

    @Column(name = "saved_amount")
    private BigDecimal savedAmount = BigDecimal.ZERO;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @CreationTimestamp
    @Column(name = "creation_date", updatable = false)
    private LocalDate creationDate;

    @Column(name = "priority")
    private String priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private GoalStatus status = GoalStatus.ACTIVE;

    @Column(name = "contribution_amount")
    private BigDecimal contributionAmount;

    // ── Contribution frequency ──────────────────────────────────────────────
    // e.g. value=5, unit=DAYS means "every 5 days"
    @Column(name = "contribution_frequency_value")
    private Integer contributionFrequencyValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "contribution_frequency_unit")
    private ContributionFrequencyUnit contributionFrequencyUnit;

    // Set to creation date initially; updated every time a contribution is recorded
    @Column(name = "last_contribution_date")
    private LocalDate lastContributionDate;

    // Only set when user says "I'll contribute later" — cleared after contribution recorded
    @Column(name = "missed_contribution_date")
    private LocalDate missedContributionDate;

    // ── Status setters ──────────────────────────────────────────────────────
    // Called when JSON provides a string like "active", "Paused", etc.
    public void setStatus(String status) {
        if (status == null) return;
        this.status = GoalStatus.valueOf(status.toUpperCase());
    }

    // Called internally when you already have a GoalStatus enum
    public void setStatus(GoalStatus status) {
        this.status = status;
    }
}