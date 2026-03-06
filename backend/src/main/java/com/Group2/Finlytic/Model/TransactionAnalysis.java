package com.Group2.Finlytic.Model;

import java.math.BigDecimal;

public record TransactionAnalysis(String category, String transactionType , BigDecimal amount) {
}