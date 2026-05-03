package com.Group2.Finlytic.Model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "transactions")
public class Transactions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type")
    private TransactionType type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "raw_message")
    private String rawMessage;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "category")
    private String category;

    @Column(name = "mpesa_code")
    private String mpesaCode;

    @Column(name = "intent")
    private String intent;

    @Column(name = "description")
    private String description;

    @Column(name = "source")
    private String source;

    @Column(name = "recipient")
    private String recipient;

    @Column(name = "ai_confidence")
    private Double aiConfidence;

    @Column(name = "goal_id")
    private Long goalId;

    @Column(name = "is_saving", nullable = false, columnDefinition = "boolean default false")
    private Boolean isSaving = false;

    @Column(name = "needs_goal_clarification", nullable = false, columnDefinition = "boolean default false")
    private Boolean needsGoalClarification = false;

    @Column(name = "suggested_goal")
    private String suggestedGoal;

    @CreationTimestamp
    @Column(name = "creation_date", updatable = false)
    private LocalDate creationDate;

    // ── Null-safe getters ──────────────────────────────────────────
    public boolean isSaving() {
        return isSaving != null && isSaving;
    }

    public boolean isNeedsGoalClarification() {
        return needsGoalClarification != null && needsGoalClarification;
    }

    public enum TransactionType {
        INCOME,
        EXPENSE
    }
}