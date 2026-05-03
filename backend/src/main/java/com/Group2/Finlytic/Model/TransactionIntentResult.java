package com.Group2.Finlytic.Model;

import java.math.BigDecimal;

public record TransactionIntentResult(
        boolean isSaving,
        boolean needsGoalClarification,
        String suggestedGoalHint,
        Long matchedGoalId,
        BigDecimal amount,
        TransactionAnalysis analysis
) {}