package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.TransactionAnalysis;
import com.Group2.Finlytic.Model.TransactionIntentResult;
import com.Group2.Finlytic.repo.Transactionsrepo;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class IntentService {

    private final Transactionsrepo transactionsrepo;
    private final CategorizationService categorizationService;
    private final GoalEngineService goalEngineService;

    public IntentService(Transactionsrepo transactionsrepo,
                         CategorizationService categorizationService,
                         GoalEngineService goalEngineService) {
        this.transactionsrepo = transactionsrepo;
        this.categorizationService = categorizationService;
        this.goalEngineService = goalEngineService;
    }

    private boolean isSavingByRules(String rawMessage) {
        String msg = rawMessage.toLowerCase();

        boolean bankTransfer =
                msg.contains("to account") ||
                        msg.contains("bank transfer") ||
                        msg.contains("sent to bank") ||
                        msg.contains("account number") ||
                        msg.contains("equity") ||
                        msg.contains("kcb") ||
                        msg.contains("co-op") ||
                        msg.contains("absa");

        boolean savingsProduct =
                msg.contains("m-shwari") ||
                        msg.contains("saving") ||
                        msg.contains("fixed deposit") ||
                        msg.contains("goal saver");

        boolean internalTransferHint =
                msg.contains("sent to") &&
                        !msg.contains("paid to") &&
                        !msg.contains("till");

        return bankTransfer || savingsProduct || internalTransferHint;
    }

    private boolean isSavingByAI(TransactionAnalysis analysis) {
        if (analysis == null || analysis.intent() == null) return false;
        return "SAVING".equalsIgnoreCase(analysis.intent());
    }

    public TransactionIntentResult processTransaction(String rawMessage, Long userId) {

        TransactionAnalysis analysis = categorizationService.analyze(rawMessage);

        boolean isSaving = isSavingByRules(rawMessage) || isSavingByAI(analysis);

        if (!isSaving) {
            return new TransactionIntentResult(
                    false, false, null, null,
                    analysis.amount(), analysis
            );
        }

        // Try silent goal match using AI's hint
        String hint = analysis.goalHint() != null ? analysis.goalHint().trim() : "";

        Long matchedGoalId = hint.isEmpty()
                ? null
                : goalEngineService.processSaving(userId, analysis.amount(), hint);

        boolean matched = matchedGoalId != null;

        return new TransactionIntentResult(
                true,
                !matched,                          // ask user only if no match
                hint.isEmpty() ? null : hint,      // pre-fill UI if hint exists
                matchedGoalId,
                analysis.amount(),
                analysis
        );
    }
}