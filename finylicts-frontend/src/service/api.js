<<<<<<< HEAD
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
=======
// Use environment variable (Vite)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Core fetch function that all requests will use
const request = async (endpoint, options = {}) => {
    const response = await fetch(`${BASE_URL}/api${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
    }

    if (response.status === 204) return null; // No content (DELETE)

    return response.json();
};

// Transactions
export const transactionService = {
    getAll: () => request('/transactions'),
    getById: (id) => request(`/transactions/${id}`),
    getByCategory: (category) =>
        request(`/transactions/category/${category}`),
    delete: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
};

// Budgets
export const budgetService = {
    getAll: () => request('/budgets'),
    getById: (id) => request(`/budgets/${id}`),
    create: (budget) =>
        request('/budgets', { method: 'POST', body: budget }),
    update: (id, budget) =>
        request(`/budgets/${id}`, { method: 'PUT', body: budget }),
    updateSpending: (id, amount) =>
        request(`/budgets/${id}/spend?amount=${amount}`, {
            method: 'PATCH',
        }),
    isExceeded: (id) => request(`/budgets/${id}/exceeded`),
    delete: (id) => request(`/budgets/${id}`, { method: 'DELETE' }),
>>>>>>> 4ad565afea13e34b8194d8d6f48ae4bf90ee19ea
};