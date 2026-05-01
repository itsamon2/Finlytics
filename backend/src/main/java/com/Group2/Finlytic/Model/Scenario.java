package com.Group2.Finlytic.Model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "scenarios")
public class Scenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scenario_id")
    private Long scenarioId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "scenario_name", nullable = false)
    private String scenarioName;

    // ── Inputs ────────────────────────────────────────────────────────────────
    @Column(name = "gross_income", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossIncome;

    @Column(name = "monthly_expenses", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyExpenses;

    @Column(name = "savings_goal_percent", precision = 5, scale = 2)
    private BigDecimal savingsGoalPercent;

    // ── Calculated fields ─────────────────────────────────────────────────────
    @Column(name = "paye", precision = 12, scale = 2)
    private BigDecimal paye;

    @Column(name = "nhif", precision = 12, scale = 2)
    private BigDecimal nhif;

    @Column(name = "nssf", precision = 12, scale = 2)
    private BigDecimal nssf;

    @Column(name = "total_deductions", precision = 12, scale = 2)
    private BigDecimal totalDeductions;

    @Column(name = "net_income", precision = 12, scale = 2)
    private BigDecimal netIncome;

    @Column(name = "monthly_savings", precision = 12, scale = 2)
    private BigDecimal monthlySavings;

    @Column(name = "annual_savings", precision = 12, scale = 2)
    private BigDecimal annualSavings;

    @Column(name = "five_year_savings", precision = 12, scale = 2)
    private BigDecimal fiveYearSavings;

    @Column(name = "savings_rate", precision = 5, scale = 2)
    private BigDecimal savingsRate;

    @Column(name = "wellness_score")
    private Integer wellnessScore;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}