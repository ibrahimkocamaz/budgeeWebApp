import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockTransactions } from '../data/mockData';

const TransactionsContext = createContext();

export const useTransactions = () => useContext(TransactionsContext);

export const TransactionsProvider = ({ children }) => {
    // Initialize with mock data for now
    const [transactions, setTransactions] = useState(mockTransactions);

    // Initial load - ensuring date objects are handled correctly if needed
    // For now, mockData dates are strings (ISO) which is fine for inputs

    const addTransaction = (newTx) => {
        setTransactions(prev => [newTx, ...prev]);
    };

    const updateTransaction = (updatedTx) => {
        setTransactions(prev => prev.map(tx =>
            tx.id === updatedTx.id ? updatedTx : tx
        ));
    };

    const deleteTransaction = (id) => {
        setTransactions(prev => prev.filter(tx => tx.id !== id));
    };

    return (
        <TransactionsContext.Provider value={{
            transactions,
            addTransaction,
            updateTransaction,
            deleteTransaction
        }}>
            {children}
        </TransactionsContext.Provider>
    );
};
