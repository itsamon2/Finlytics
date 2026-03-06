package com.Group2.Finlytic.repo;

import com.Group2.Finlytic.Model.Transactions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Transactionsrepo extends JpaRepository<Transactions, Long> {
}
