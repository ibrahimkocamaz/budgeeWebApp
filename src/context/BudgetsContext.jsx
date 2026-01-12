import React, { createContext, useContext, useState } from 'react';
import { mockBudgets } from '../data/mockData';

const BudgetsContext = createContext();

export const useBudgets = () => useContext(BudgetsContext);

export const BudgetsProvider = ({ children }) => {
    // Initialize with mock data for now
    const [budgets, setBudgets] = useState(mockBudgets);

    const addBudget = (newBudget) => {
        setBudgets(prev => [newBudget, ...prev]);
    };

    const updateBudget = (updatedBudget) => {
        setBudgets(prev => prev.map(budget =>
            budget.id === updatedBudget.id ? updatedBudget : budget
        ));
    };

    const deleteBudget = (id) => {
        setBudgets(prev => prev.filter(budget => budget.id !== id));
    };

    return (
        <BudgetsContext.Provider value={{
            budgets,
            addBudget,
            updateBudget,
            deleteBudget
        }}>
            {children}
        </BudgetsContext.Provider>
    );
};
