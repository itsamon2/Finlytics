package com.Group2.Finlytic.Model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "transactions")
public class Transactions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type")
    private TransactionType type;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "raw_message")
    private String rawMessage;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "category")
    private String category;

    @Column(name = "mpesa_code", unique = false)
    private String mpesaCode;  // ← ADDED

    @Column(name = "description")
    private String description;  // ← ADDED

    @CreationTimestamp
    @Column(name = "creation_date", updatable = false)
    private LocalDate creationDate;

    public enum TransactionType {
        INCOME,
        EXPENSE
    }
}