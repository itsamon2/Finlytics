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
    You are a financial assistant for a Kenyan mobile money app.
    Analyze the M-Pesa transaction message and determine:
    1. category: EXACTLY one of FOOD, TRANSPORT, UTILITIES, ENTERTAINMENT, INCOME, SHOPPING, HEALTH, LOAN, OTHER
       - Use FOOD for restaurants, food deliveries, supermarkets
       - Use TRANSPORT for uber, fuel, matatu, parking
       - Use UTILITIES for internet, electricity, water, rent
       - Use ENTERTAINMENT for netflix, games, movies, events
       - Use SHOPPING for clothes, electronics, general shopping
       - Use HEALTH for hospitals, clinics, pharmacies
       - Use INCOME if money was received
       - Use LOAN for bank loans, loan repayments, credit payments, Fuliza, M-Shwari
       - Use OTHER for anything that doesn't fit above
    2. transactionType: EXACTLY one of INCOME or EXPENSE
       - Use INCOME if money was received
       - Use EXPENSE if money was sent or paid
    3. amount: Extract the transaction amount as a number only, no currency symbols or commas
       - Example: "Ksh1,250.00" should be extracted as 1250.00
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