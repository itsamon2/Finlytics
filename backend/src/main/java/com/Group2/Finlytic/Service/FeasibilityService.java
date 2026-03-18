package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.Goals;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Service
public class FeasibilityService {

    @Autowired
    GoalsService goalsService;

    @Autowired
    TransactionsService transactionsService;

    private final ChatClient chatClient;

    public FeasibilityService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public String feasibility(Long goalId) {

        Goals goals = goalsService.getGoalsById(goalId);
        if (goals == null) {
            throw new RuntimeException("Goal not found with id: " + goalId);
        }

        BigDecimal monthlyIncome = transactionsService.getMonthlyIncome();
        Map<String, BigDecimal> expenses = transactionsService.getMonthlyExpensesByCategory();

        BigDecimal totalExpenses = expenses.values()
                .stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal monthlySurplus = monthlyIncome.subtract(totalExpenses);

        // --- Goal calculations ---
        BigDecimal targetAmount    = goals.getTargetAmount();
        BigDecimal savedAmount     = goals.getSavedAmount();
        BigDecimal remainingAmount = targetAmount.subtract(savedAmount);

        LocalDate today      = LocalDate.now();
        LocalDate targetDate = goals.getTargetDate();
        long remainingMonths = ChronoUnit.MONTHS.between(today, targetDate);

        BigDecimal requiredMonthlySaving = remainingMonths > 0
                ? remainingAmount.divide(BigDecimal.valueOf(remainingMonths), 2, RoundingMode.HALF_UP)
                : remainingAmount;

        // --- Preliminary status ---
        String feasibilityStatus;
        if (remainingMonths <= 0) {
            feasibilityStatus = "DEADLINE REACHED";
        } else if (monthlySurplus.compareTo(requiredMonthlySaving) >= 0) {
            feasibilityStatus = "FEASIBLE";
        } else if (monthlySurplus.compareTo(requiredMonthlySaving.multiply(BigDecimal.valueOf(0.7))) >= 0) {
            feasibilityStatus = "RISKY";
        } else {
            feasibilityStatus = "NOT FEASIBLE";
        }

        // --- Expenses breakdown ---
        String expensesBreakdown = expenses.entrySet()
                .stream()
                .map(e -> "  - " + e.getKey() + ": " + e.getValue())
                .reduce("", (a, b) -> a + "\n" + b);

        // --- Build prompt ---
        String prompt = String.format("""
                You are a personal financial advisor. Analyze the following goal and financial data,
                then provide detailed, practical, and encouraging financial advice.

                === GOAL DETAILS ===
                - Goal Name        : %s
                - Goal Type        : %s
                - Priority         : %s
                - Status           : %s
                - Target Amount    : %s
                - Saved So Far     : %s
                - Remaining        : %s
                - Target Date      : %s
                - Months Left      : %d
                - Contribution Amt : %s
                - Next Contribution: %s

                === FINANCIAL SNAPSHOT (from transaction history) ===
                - Monthly Income   : %s
                - Total Expenses   : %s
                  (Breakdown:
                %s)
                - Monthly Surplus  : %s
                - Required Monthly Saving: %s

                === PRELIMINARY ASSESSMENT ===
                - Status: %s

                Based on all the above, provide a detailed financial advice paragraph that includes:
                1. A clear verdict on whether this goal is achievable
                2. Specific advice on adjusting contributions or cutting specific expenses
                3. What risks could derail this goal and how to mitigate them
                4. An encouraging closing remark tailored to this specific goal and category

                Keep the tone professional but friendly. Be specific with numbers where relevant.
                All the numbers involded are Ksh. Display the amount as "Ksh 1200.00 not 1200 ksh"
                """,
                goals.getGoalName(),
                goals.getGoalType(),
                goals.getPriority(),
                goals.getStatus(),
                targetAmount,
                savedAmount,
                remainingAmount,
                targetDate,
                remainingMonths,
                goals.getContributionAmount(),
                goals.getNextContributionDate(),
                monthlyIncome,
                totalExpenses,
                expensesBreakdown,
                monthlySurplus,
                requiredMonthlySaving,
                feasibilityStatus
        );

        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }
}