package com.Group2.Finlytic.Model;

import jakarta.persistence.*;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
@Entity
@Data
@Table(name = "income_profile")
public class IncomeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long incomeProfileId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "income", nullable = false)
    private BigDecimal declaredMonthlyIncome;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;

    @Column(name = "updated_date", nullable = false)
    private LocalDate updatedDate;

}