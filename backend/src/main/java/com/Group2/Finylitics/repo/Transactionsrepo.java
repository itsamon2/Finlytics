package com.Group2.Finylitics.repo;

import com.Group2.Finylitics.Model.Transactions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface Transactionsrepo extends JpaRepository<Transactions, Long> {
}
