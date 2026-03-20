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

        // --- Feasibility verdict ---
        String feasibilityStatus;
        String feasibilityEmoji;
        if (remainingMonths <= 0) {
            feasibilityStatus = "DEADLINE REACHED";
            feasibilityEmoji  = "🔴";
        } else if (monthlySurplus.compareTo(requiredMonthlySaving) >= 0) {
            feasibilityStatus = "FEASIBLE";
            feasibilityEmoji  = "✅";
        } else if (monthlySurplus.compareTo(requiredMonthlySaving.multiply(BigDecimal.valueOf(0.7))) >= 0) {
            feasibilityStatus = "RISKY";
            feasibilityEmoji  = "⚠️";
        } else {
            feasibilityStatus = "NOT FEASIBLE";
            feasibilityEmoji  = "🔴";
        }

        // --- Gap or buffer ---
        BigDecimal monthlyBuffer = monthlySurplus.subtract(requiredMonthlySaving);
        boolean hasSurplus = monthlyBuffer.compareTo(BigDecimal.ZERO) >= 0;

        // --- Expenses breakdown ---
        String expensesBreakdown = expenses.entrySet()
                .stream()
                .map(e -> "  - " + e.getKey() + ": Ksh " + e.getValue())
                .reduce("", (a, b) -> a + "\n" + b);

        // --- Build prompt ---
        String prompt = String.format("""
                You are a friendly personal financial advisor speaking directly to the person reading this.
                Always use "you" and "your" — never refer to "the user".
                Your job is to provide a FEASIBILITY ASSESSMENT — a clear, honest diagnosis of whether
                this goal is achievable based on current finances. Do NOT give an action plan (that is
                handled separately). Focus only on the numbers, the verdict, and the key obstacles or strengths.

                === GOAL DETAILS ===
                - Goal Name        : %s
                - Goal Type        : %s
                - Priority         : %s
                - Status           : %s
                - Target Amount    : Ksh %s
                - Saved So Far     : Ksh %s
                - Remaining        : Ksh %s
                - Target Date      : %s
                - Months Left      : %d
                - Contribution Amt : Ksh %s
                - Next Contribution: %s

                === FINANCIAL SNAPSHOT ===
                - Monthly Income   : Ksh %s
                - Total Expenses   : Ksh %s
                  (Breakdown:
                %s)
                - Monthly Surplus  : Ksh %s
                - Required Monthly Saving: Ksh %s
                - Monthly Buffer / Gap   : %s Ksh %s

                === SYSTEM VERDICT ===
                %s %s

                Generate a structured feasibility report with these EXACT sections:

                ## %s Verdict
                (1 sentence: state clearly whether the goal is feasible, risky, or not feasible and why in one line)

                ## 📈 Financial Position
                (3-4 sentences: break down the numbers — income, expenses, surplus, what the required saving is,
                and whether the current surplus covers it. Be precise with Ksh amounts.)

                ## 🔍 Key Factors
                (2-3 bullet points: the specific financial factors that most impact this goal's feasibility —
                could be positive strengths or negative obstacles. Use actual Ksh figures.)

                ## 🚧 What Could Go Wrong
                (2 specific risks based on the expense breakdown and goal type that could make this goal
                infeasible. Keep it diagnostic — no solutions here.)

                ## 📋 Summary
                (2 sentences: overall feasibility conclusion and the single most important number you
                need to keep in mind — e.g. the required monthly saving or the monthly gap.)

                Rules:
                - Always use "Ksh X,XXX.XX" format for all amounts
                - Always speak directly to the person — use "you" and "your", never "the user"
                - Be factual and diagnostic — no action steps
                - Do NOT suggest what to do — that is the advisory report's job
                - Tone: clear, honest, warm and professional
                - All amounts are in Kenyan Shillings (Ksh)
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
                hasSurplus ? "Buffer:" : "Gap:",
                monthlyBuffer.abs(),
                feasibilityEmoji,
                feasibilityStatus,
                feasibilityEmoji
        );

        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }
}