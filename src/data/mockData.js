export const mockUser = {
  name: "Ibrahim",
  avatar: "/assets/1.png",
};

export const mockSummary = {
  totalBalance: 12450.50,
  monthlyIncome: 4500.00,
  monthlyExpenses: 1250.00,
  savings: 3200.50
};

export const mockTransactions = [
  {
    id: 'tx1',
    amount: 85.50,
    category: 'food',
    date: new Date().toISOString(), // Today
    description: 'Weekly Groceries',
    paymentType: 'single',
    type: 'expense',
    userId: 'user1'
  },
  {
    id: 'tx1b',
    amount: 14.00,
    category: 'transport',
    date: new Date().toISOString(), // Same day
    description: 'Taxi to Office',
    paymentType: 'single',
    type: 'expense',
    userId: 'user1'
  },
  {
    id: 'tx2',
    amount: 4500.00,
    category: 'salary',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    description: 'Tech Corp Salary',
    paymentType: 'single',
    type: 'income',
    userId: 'user1'
  },
  {
    id: 'tx3',
    amount: 45.00,
    category: 'transport',
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    description: 'Uber Ride',
    paymentType: 'single',
    type: 'expense',
    userId: 'user1'
  },
  {
    id: 'tx4',
    amount: 1200.00,
    category: 'housing',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    description: 'Rent Payment 5/12',
    paymentType: 'installment',
    type: 'expense',
    recurring: 1,
    totalRecurringTransactions: 12,
    recurringTransactionCount: 5, // Current installment number
    items: {
      parentTransactionId: 'parent_rent_2026'
    },
    userId: 'user1'
  },
  {
    id: 'tx5',
    amount: 15.99,
    category: 'entertainment',
    date: new Date(Date.now() - 86400000 * 6).toISOString(),
    description: 'Spotify Premium',
    paymentType: 'single',
    type: 'expense',
    userId: 'user1'
  },
  {
    id: 'tx6',
    amount: 150.00,
    category: 'shopping',
    date: new Date(Date.now() - 86400000 * 10).toISOString(),
    description: 'New Sneakers',
    paymentType: 'single',
    type: 'expense',
    userId: 'user1'
  }
];

export const mockBudgets = [
  {
    id: 'b1',
    name: 'Groceries',
    category: 'food',
    amount: 800.00,
    period: 'monthly',
    color: '#FF9800'
  },
  {
    id: 'b2',
    name: 'Transport',
    category: 'transport',
    amount: 300.00,
    period: 'monthly',
    color: '#2196F3'
  }
];

export const mockSpendingByCategory = [
  { name: 'Housing', value: 1200, color: '#FF6B6B' },
  { name: 'Food', value: 350, color: '#4ECDC4' },
  { name: 'Transport', value: 150, color: '#45B7D1' },
  { name: 'Shopping', value: 200, color: '#96CEB4' },
  { name: 'Entertainment', value: 80, color: '#FFEEAD' },
];
