const BASE_URL = 'http://localhost:8080/api';

// Core fetch function that all requests will use
const request = async (endpoint, options = {}) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
    if (response.status === 204) return null; // No content (DELETE)
    return response.json();
};

// Transactions
export const transactionService = {
    getAll: () => request('/transactions'),
    getById: (id) => request(`/transactions/${id}`),
    delete: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
};

// Budgets
export const budgetService = {
    getAll: () => request('/budgets'),
    getById: (id) => request(`/budgets/${id}`),
    create: (budget) => request('/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget)
    }),
    updateSpending: (id, amount) => request(`/budgets/${id}/spend?amount=${amount}`, {
        method: 'PATCH'
    }),
    isExceeded: (id) => request(`/budgets/${id}/exceeded`),
    delete: (id) => request(`/budgets/${id}`, { method: 'DELETE' }),
};