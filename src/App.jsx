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
import './App.css';

import { TransactionsProvider } from './context/TransactionsContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { BudgetsProvider } from './context/BudgetsContext';
import { SettingsProvider } from './context/SettingsContext';

function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <CategoriesProvider>
          <BudgetsProvider>
            <TransactionsProvider>
              <CurrencyProvider>
                <ThemeProvider>
                  <Router>
                    <div className="app-container">
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/transactions" element={<Transactions />} />
                          <Route path="/budgets" element={<Budgets />} />
                          <Route path="/add" element={<AddTransaction />} />
                          <Route path="/add-transaction" element={<Navigate to="/add" replace />} />
                          <Route path="/categories" element={<ManageCategories />} />
                          <Route path="/recurring" element={<RecurringTransactions />} />
                          <Route path="/settings" element={<Settings />} />
                        </Routes>
                      </Layout>
                    </div>
                  </Router>
                </ThemeProvider>
              </CurrencyProvider>
            </TransactionsProvider>
          </BudgetsProvider>
        </CategoriesProvider>
      </LanguageProvider>
    </SettingsProvider>
  );
}

export default App;
