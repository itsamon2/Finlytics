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
public class AdvisoryService {

    @Autowired
    private GoalsService goalsService;

    @Autowired
    private TransactionsService transactionsService;

    @Autowired
    private GoalAnalyticService goalAnalyticService;

    private final ChatClient chatClient;

    public AdvisoryService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public String advise(Long goalId) {

        // ── Goal data ──────────────────────────────────────────────────────────
        Goals goal = goalsService.getGoalsById(goalId);
        if (goal == null) {
            throw new RuntimeException("Goal not found with id: " + goalId);
        }

        // ── Financial data ─────────────────────────────────────────────────────
        BigDecimal monthlyIncome = transactionsService.getMonthlyIncome();
        Map<String, BigDecimal> expenses = transactionsService.getMonthlyExpensesByCategory();
        BigDecimal totalExpenses = expenses.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal monthlySurplus = monthlyIncome.subtract(totalExpenses);

        // ── Goal calculations ──────────────────────────────────────────────────
        BigDecimal targetAmount = goal.getTargetAmount();
        BigDecimal savedAmount = goal.getSavedAmount() != null ? goal.getSavedAmount() : BigDecimal.ZERO;
        BigDecimal remainingAmount = targetAmount.subtract(savedAmount);

        long remainingMonths = ChronoUnit.MONTHS.between(LocalDate.now(), goal.getTargetDate());
        if (remainingMonths <= 0) remainingMonths = 1;

        BigDecimal requiredMonthlySaving = remainingAmount
                .divide(BigDecimal.valueOf(remainingMonths), 2, RoundingMode.HALF_UP);

        // ── Analytics ─────────────────────────────────────────────────────────
        double savingProgress = goalAnalyticService.calculateProgress(goalId);
        double timeProgress = goalAnalyticService.calculateTimeProgress(goalId);
        String performanceStatus = goalAnalyticService.getPerformanceStatus(goalId);

        // ── Shortfall calculation ──────────────────────────────────────────────
        BigDecimal monthlyGap = requiredMonthlySaving.subtract(monthlySurplus);
        boolean isOnTrack = monthlySurplus.compareTo(requiredMonthlySaving) >= 0;

        // ── Advisory tier ──────────────────────────────────────────────────────
        String advisoryTier;
        if (isOnTrack) {
            advisoryTier = "ON TRACK — provide optimisation tips and stretch goals";
        } else if (monthlyGap.compareTo(monthlySurplus.multiply(BigDecimal.valueOf(0.3))) <= 0) {
            advisoryTier = "SLIGHT SHORTFALL — small adjustments needed, identify quick wins";
        } else if (monthlyGap.compareTo(monthlySurplus.multiply(BigDecimal.valueOf(0.7))) <= 0) {
            advisoryTier = "MODERATE SHORTFALL — significant spending cuts required across categories";
        } else {
            advisoryTier = "CRITICAL SHORTFALL — goal timeline or target needs renegotiation";
        }

        // ── Expenses breakdown ─────────────────────────────────────────────────
        String expensesBreakdown = expenses.entrySet().stream()
                .map(e -> "  - " + e.getKey() + ": Ksh " + e.getValue())
                .reduce("", (a, b) -> a + "\n" + b);

        // ── Top 2 discretionary categories ────────────────────────────────────
        String cuttableCategories = expenses.entrySet().stream()
                .filter(e -> {
                    String cat = e.getKey().toUpperCase();
                    return cat.equals("ENTERTAINMENT") || cat.equals("SHOPPING")
                            || cat.equals("OTHER") || cat.equals("FOOD");
                })
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(2)
                .map(e -> "  - " + e.getKey() + ": Ksh " + e.getValue())
                .reduce("", (a, b) -> a + "\n" + b);

        // ── Build prompt ───────────────────────────────────────────────────────
        String prompt = String.format("""
                You are a friendly personal financial advisor speaking directly to the person reading this.
                Always use "you" and "your" — never refer to "the user".
                Your job is to provide a STRUCTURED ACTION PLAN — not a feasibility assessment.
                The feasibility check has already been done. Focus only on HOW to achieve the goal.

                === GOAL ===
                - Name             : %s
                - Type             : %s
                - Priority         : %s
                - Target Amount    : Ksh %s
                - Saved So Far     : Ksh %s
                - Remaining        : Ksh %s
                - Target Date      : %s
                - Months Left      : %d
                - Contribution Amt : Ksh %s
                - Next Contribution: %s

                === PROGRESS ANALYTICS ===
                - Saving Progress  : %.1f%% of target saved
                - Time Progress    : %.1f%% of timeline elapsed
                - Performance      : %s
                  (If saving progress > time progress = ahead of schedule, else behind)

                === FINANCIAL SNAPSHOT ===
                - Monthly Income   : Ksh %s
                - Total Expenses   : Ksh %s
                  (Breakdown:
                %s)
                - Monthly Surplus  : Ksh %s
                - Required Monthly Saving: Ksh %s
                - Monthly Gap (shortfall): Ksh %s

                === TOP DISCRETIONARY CATEGORIES TO REVIEW ===
                %s

                === ADVISORY TIER ===
                %s

                Based on ALL the above, generate a structured advisory plan with these EXACT sections:

                ## 📊 Where You Stand
                (2-3 sentences: saving progress vs time progress, performance status, what it means practically)

                ## 🎯 Your Monthly Action Plan
                (3-5 specific, numbered steps the user should take THIS month — use actual Ksh amounts)

                ## ✂️ Quick Wins
                (2-3 specific spending cuts from the discretionary categories above — with exact Ksh amounts and %% reductions)

                ## ⚠️ Risks to Watch
                (2 realistic risks specific to this goal type and their mitigation)

                ## 🔄 If You Can't Close the Gap
                (1-2 honest alternatives: extend the timeline, adjust the target, or increase income — with specific numbers)

                ## 💪 Motivational Close
                (1-2 sentences tailored to this specific goal name and category)

                Rules:
                - Always use "Ksh X,XXX.XX" format for all amounts
                - Always speak directly to the person — use "you" and "your", never "the user"
                - Be specific with numbers, never vague
                - Do NOT repeat the feasibility verdict — assume you already know it
                - Tone: professional, direct, warm and encouraging
                - All amounts are in Kenyan Shillings (Ksh)
                """,
                goal.getGoalName(),
                goal.getGoalType(),
                goal.getPriority(),
                targetAmount,
                savedAmount,
                remainingAmount,
                goal.getTargetDate(),
                remainingMonths,
                goal.getContributionAmount(),
                goalsService.getNextContributionDate(goal),
                savingProgress,
                timeProgress,
                performanceStatus,
                monthlyIncome,
                totalExpenses,
                expensesBreakdown,
                monthlySurplus,
                requiredMonthlySaving,
                monthlyGap.max(BigDecimal.ZERO),
                cuttableCategories.isBlank() ? "  No discretionary categories found" : cuttableCategories,
                advisoryTier
        );

        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }
}