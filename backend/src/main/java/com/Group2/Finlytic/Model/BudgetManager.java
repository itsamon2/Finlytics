package com.Group2.Finlytic.Model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "budget_manager")
public class BudgetManager {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long budgetId;

    @Column(name = "user_id", nullable = false)  // ✅ add this
    private Long userId;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal budgetLimit = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal amountSpent = BigDecimal.ZERO;

    @Column(length = 20)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(name = "budget_period")
    private BudgetPeriod budgetPeriod;

    @CreationTimestamp
    @Column(name = "creation_date", updatable = false)
    private LocalDate creationDate;

    public enum BudgetPeriod {
        DAILY,
        WEEKLY,
        MONTHLY,
        YEARLY
    }
}