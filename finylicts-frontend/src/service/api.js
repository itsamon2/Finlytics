export const transactionService = {
  getAll: async () => {
    try {
      const response = await fetch('http://localhost:8080/api/transactions');
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.warn('Backend not running, using mock data');
      // Return mock data for development
      return [
        { id: 1, date: '2026-03-03', description: 'Grocery Store', amount: -82.50, category: 'Food', type: 'EXPENSE' },
        { id: 2, date: '2026-03-01', description: 'Salary Deposit', amount: 5240.00, category: 'Income', type: 'INCOME' },
      ];
    }
  }
};