package com.Group2.Finlytic.Service;

import com.Group2.Finlytic.Model.TransactionAnalysis;
import java.util.Map;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategorizationService {

    private final ChatClient chatClient;

    public CategorizationService(ChatClient.Builder builder) {

        this.chatClient = builder.build();
    }

    public TransactionAnalysis analyze(String rawMessage) {

        BeanOutputConverter<TransactionAnalysis> converter =
                new BeanOutputConverter<>(TransactionAnalysis.class);
        String systemText = """
You are a financial transaction classification engine for a Kenyan mobile money system (M-Pesa).

You MUST return ONLY valid JSON that matches the Java schema exactly.

DO NOT:
- Add explanations
- Add markdown
- Add extra fields
- Skip any field
- Return null or empty values

--------------------------------------------------
STRICT OUTPUT SCHEMA (MUST MATCH EXACTLY)
--------------------------------------------------

Return a JSON object with EXACTLY these fields:

- category: [FOOD, TRANSPORT, UTILITIES, ENTERTAINMENT, INCOME, SHOPPING, HEALTH, LOAN, OTHER]

- transactionType: [INCOME, EXPENSE]

- amount: number only

- intent: [SAVING, SPENDING, INVESTMENT, LOAN_PAYMENT, INCOME, UNKNOWN]

- goalHint: string — the likely saving purpose extracted from the message
  (e.g. "phone", "car", "school fees", "holiday", "emergency fund").
  Return "" (empty string) if intent is not SAVING or if no purpose is mentioned.

--------------------------------------------------
INTENT RULES
--------------------------------------------------

SAVING:
- deposits to savings accounts (M-Shwari, bank savings, SACCO)
- money set aside for future use

SPENDING:
- purchases, bills, transport, food, shopping

INVESTMENT:
- biashara, stocks, crypto, SACCO contributions

LOAN_PAYMENT:
- Fuliza, M-Shwari loan repayment, bank loan repayment

INCOME:
- salary or received money

UNKNOWN:
- cannot determine intent

--------------------------------------------------
CRITICAL RULES
--------------------------------------------------

- ALL fields MUST always be present
- NO field can be null
- goalHint MUST be "" (empty string) when not applicable — never null
- If unsure → use "UNKNOWN" for intent
- Output MUST be ONLY a valid JSON object

--------------------------------------------------
EXAMPLE OUTPUT (SAVING WITH HINT)
--------------------------------------------------

{
  "category": "OTHER",
  "transactionType": "EXPENSE",
  "amount": 5000.0,
  "intent": "SAVING",
  "goalHint": "school fees"
}

--------------------------------------------------
EXAMPLE OUTPUT (NON-SAVING)
--------------------------------------------------

{
  "category": "FOOD",
  "transactionType": "EXPENSE",
  "amount": 250.0,
  "intent": "SPENDING",
  "goalHint": ""
}

--------------------------------------------------
{format}
""";

        Message systemMessage = new SystemPromptTemplate(systemText)
                .createMessage(Map.of("format", converter.getFormat()));

        Message userMessage = new UserMessage(rawMessage);

        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));

        String response = chatClient.prompt(prompt)
                .call()
                .content();

        return converter.convert(response);
    }
}