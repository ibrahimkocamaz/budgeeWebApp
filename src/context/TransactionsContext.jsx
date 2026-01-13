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

    const deleteTransactions = (ids) => {
        const idSet = new Set(ids);
        setTransactions(prev => prev.filter(tx => !idSet.has(tx.id)));
    };

    const updateTransactions = (updates) => {
        // updates is an array of full transaction objects
        const updateMap = new Map(updates.map(tx => [tx.id, tx]));
        setTransactions(prev => prev.map(tx =>
            updateMap.has(tx.id) ? updateMap.get(tx.id) : tx
        ));
    };

    return (
        <TransactionsContext.Provider value={{
            transactions,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            deleteTransactions,
            updateTransactions
        }}>
            {children}
        </TransactionsContext.Provider>
    );
};
