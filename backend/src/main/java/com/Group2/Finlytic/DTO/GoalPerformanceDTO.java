package com.Group2.Finlytic.DTO;

import java.math.BigDecimal;

public record GoalPerformanceDTO(
        double savingProgress,
        double timeProgress,
        String performanceStatus,
        BigDecimal remainingAmount,
        BigDecimal requiredMonthlySaving
) {}