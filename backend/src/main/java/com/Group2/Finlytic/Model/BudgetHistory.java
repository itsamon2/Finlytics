package com.Group2.Finlytic.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "budget_history")
public class BudgetHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "budget_limit", nullable = false)
    private BigDecimal budgetLimit;

    @Column(name = "amount_spent")
    private BigDecimal amountSpent = BigDecimal.ZERO;

    @Column(name = "color")
    private String color;

    @Column(name = "budget_period")
    private String budgetPeriod;

    // Month and year this snapshot belongs to
    @Column(name = "month", nullable = false)
    private int month;

    @Column(name = "year", nullable = false)
    private int year;

    // When the snapshot was taken
    @Column(name = "snapshot_date")
    private LocalDate snapshotDate;
}