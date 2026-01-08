import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { CategoriesProvider } from './context/CategoriesContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import AddTransaction from './components/AddTransaction';
import ManageCategories from './components/ManageCategories';
import Settings from './components/Settings';
import './App.css';

import { CurrencyProvider } from './context/CurrencyContext';

function App() {
  return (
    <LanguageProvider>
      <CategoriesProvider>
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
                    <Route path="/categories" element={<ManageCategories />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </Layout>
              </div>
            </Router>
          </ThemeProvider>
        </CurrencyProvider>
      </CategoriesProvider>
    </LanguageProvider>
  );
}

export default App;
