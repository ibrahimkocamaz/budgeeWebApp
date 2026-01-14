import React, { createContext, useContext, useState } from 'react';
import { mockAccounts } from '../data/mockData';

const AccountsContext = createContext();

export const useAccounts = () => useContext(AccountsContext);

export const AccountsProvider = ({ children }) => {
    const [accounts, setAccounts] = useState(mockAccounts);

    const addAccount = (newAccount) => {
        setAccounts(prev => [...prev, newAccount]);
    };

    const updateAccount = (updatedAccount) => {
        setAccounts(prev => prev.map(acc =>
            acc.id === updatedAccount.id ? updatedAccount : acc
        ));
    };

    const deleteAccount = (id) => {
        setAccounts(prev => prev.filter(acc => acc.id !== id));
    };

    return (
        <AccountsContext.Provider value={{
            accounts,
            addAccount,
            updateAccount,
            deleteAccount
        }}>
            {children}
        </AccountsContext.Provider>
    );
};
