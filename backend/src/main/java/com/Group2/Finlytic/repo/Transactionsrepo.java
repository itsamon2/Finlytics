package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.Transactions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Transactionsrepo extends JpaRepository<Transactions, Long> {
    // Spring Data JPA auto-generates: SELECT * FROM transactions WHERE category = ?
    List<Transactions> findByCategory(String category);
}