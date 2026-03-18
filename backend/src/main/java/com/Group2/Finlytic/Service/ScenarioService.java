//package com.Group2.Finlytic.Service;
//
//import com.Group2.Finlytic.Model.Goals;
//import com.Group2.Finlytic.Model.Transactions;
//import org.springframework.ai.chat.client.ChatClient;
//import org.springframework.beans.factory.annotation.Autowired;
//
//import java.util.Optional;
//
//public class ScenarioService {
//
//    @Autowired
//    public GoalsService goalsService;
//
//    @Autowired
//    public TransactionsService transactionsService;
//
//    private final ChatClient chatClient;
//
//    public ScenarioService(ChatClient.Builder builder) {
//
//        this.chatClient = builder.build();
//    }
//    public void scenarios (String goal_name , Long transactionId){
//        Goals goals = goalsService.getGoalsByName(goal_name);
//
//        Optional<Transactions> transaction = transactionsService.getTransactionById(transactionId);
//
//        if (goals == null) {
//            throw new RuntimeException("goal with id " + goal_name + " not found");
//        }
//    }
//
//}
