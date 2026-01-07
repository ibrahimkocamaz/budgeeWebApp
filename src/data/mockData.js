export const mockUser = {
  name: "Ibrahim",
  avatar: "/assets/1.png", // Using the provided screenshot as a placeholder/avatar if suitable, or just for testing
};

export const mockSummary = {
  totalBalance: 12450.00,
  monthlyIncome: 4200.00,
  monthlyExpenses: 2800.00,
  savingsRate: 33, // Percentage
};

export const mockTransactions = [
  {
    id: 1,
    title: "Grocery Shopping",
    amount: -120.50,
    date: "2024-03-10",
    category: "Food",
    type: "expense",
    merchant: "Whole Foods"
  },
  {
    id: 2,
    title: "Salary Deposit",
    amount: 3200.00,
    date: "2024-03-01",
    category: "Salary",
    type: "income",
    merchant: "Tech Corp Inc."
  },
  {
    id: 3,
    title: "Netflix Subscription",
    amount: -15.99,
    date: "2024-03-05",
    category: "Entertainment",
    type: "expense",
    merchant: "Netflix"
  },
  {
    id: 4,
    title: "Electric Bill",
    amount: -85.20,
    date: "2024-03-03",
    category: "Utilities",
    type: "expense",
    merchant: "City Power"
  },
  {
    id: 5,
    title: "Freelance Project",
    amount: 500.00,
    date: "2024-03-08",
    category: "Income",
    type: "income",
    merchant: "Client X"
  },
  {
    id: 6,
    title: "Gym Membership",
    amount: -45.00,
    date: "2024-03-02",
    category: "Health",
    type: "expense",
    merchant: "FitGym"
  }
];

export const mockSpendingByCategory = [
  { name: 'Food', value: 450, color: '#0aac35' },
  { name: 'Rent', value: 1200, color: '#2196f3' },
  { name: 'Transport', value: 300, color: '#ffab00' },
  { name: 'Utilities', value: 200, color: '#a82319' },
  { name: 'Entertainment', value: 150, color: '#9c27b0' },
];
