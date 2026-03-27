const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const TOKEN_KEY = 'auth_token';

// ── Base request helper ──────────────────────────────────────────────────────
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}/api${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Token expired or invalid — clear session and send to login
  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
    return;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} - ${errorText}`);
  }

  if (response.status === 204) return null;
  return response.json();
};

// ── Text response helper (AI endpoints that return plain text) ───────────────
const requestText = async (endpoint) => {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(`${BASE_URL}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
    return;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} - ${errorText}`);
  }

  return response.text();
};

// ── Services (unchanged) ─────────────────────────────────────────────────────
export const transactionService = {
  getAll:         ()           => request('/transactions'),
  getById:        (id)         => request(`/transactions/${id}`),
  getByCategory:  (category)   => request(`/transactions/category/${category}`),
  delete:         (id)         => request(`/transactions/${id}`, { method: 'DELETE' }),
};

export const budgetService = {
  getAll:          ()              => request('/budgets'),
  getById:         (id)            => request(`/budgets/${id}`),
  create:          (budget)        => request('/budgets',              { method: 'POST',  body: budget }),
  update:          (id, budget)    => request(`/budgets/${id}`,        { method: 'PUT',   body: budget }),
  updateSpending:  (id, amount)    => request(`/budgets/${id}/spend?amount=${amount}`, { method: 'PATCH' }),
  isExceeded:      (id)            => request(`/budgets/${id}/exceeded`),
  delete:          (id)            => request(`/budgets/${id}`,        { method: 'DELETE' }),
};

export const goalsService = {
  getAll:       ()          => request('/goals'),
  getById:      (id)        => request(`/goals/${id}`),
  create:       (goal)      => request('/goals',               { method: 'POST', body: goal }),
  update:       (goal)      => request('/goals',               { method: 'PUT',  body: goal }),
  updateStatus: (id, status)=> request(`/goals/id/${id}/status?status=${status}`, { method: 'PATCH' }),
  search:       (name)      => request(`/goals/search?goal_name=${encodeURIComponent(name)}`),
  delete:       (id)        => request(`/goals/${id}`,         { method: 'DELETE' }),
  getFeasibility: (id)      => requestText(`/feasibility/check/${id}`),
  getAdvisory:    (id)      => requestText(`/advisory/check/${id}`),
};