import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { CategoriesProvider } from './context/CategoriesContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import AddTransaction from './components/AddTransaction';
import ManageCategories from './components/ManageCategories';
import RecurringTransactions from './components/RecurringTransactions';
import Settings from './components/Settings';
import Accounts from './components/Accounts';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

import { TransactionsProvider } from './context/TransactionsContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { BudgetsProvider } from './context/BudgetsContext';
import { SettingsProvider } from './context/SettingsContext';
import { AccountsProvider } from './context/AccountsContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <LanguageProvider>
            <CategoriesProvider>
              <BudgetsProvider>
                <AccountsProvider>
                  <TransactionsProvider>
                    <CurrencyProvider>
                      <ThemeProvider>
                        <div className="app-container">
                          <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<SignUp />} />

                            {/* Protected Routes */}
                            <Route path="/*" element={
                              <ProtectedRoute>
                                <Layout>
                                  <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/transactions" element={<Transactions />} />
                                    <Route path="/budgets" element={<Budgets />} />
                                    <Route path="/accounts" element={<Accounts />} />
                                    <Route path="/add" element={<AddTransaction />} />
                                    <Route path="/add-transaction" element={<Navigate to="/add" replace />} />
                                    <Route path="/categories" element={<ManageCategories />} />
                                    <Route path="/recurring" element={<RecurringTransactions />} />
                                    <Route path="/settings" element={<Settings />} />
                                  </Routes>
                                </Layout>
                              </ProtectedRoute>
                            } />
                          </Routes>
                        </div>
                      </ThemeProvider>
                    </CurrencyProvider>
                  </TransactionsProvider>
                </AccountsProvider>
              </BudgetsProvider>
            </CategoriesProvider>
          </LanguageProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
