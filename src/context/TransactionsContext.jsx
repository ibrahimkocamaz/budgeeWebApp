import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { useAccounts } from './AccountsContext';
import { toCents, toDollars } from '../utils/moneyUtils';

const TransactionsContext = createContext();

export const useTransactions = () => useContext(TransactionsContext);

export const TransactionsProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const { user } = useAuth();
    const { accounts, fetchAccounts } = useAccounts();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user) {
            fetchTransactions();
        } else {
            setTransactions([]);
        }
    }, [user]);

    const formatTransaction = (tx) => ({
        ...tx,
        recurringTransactionCount: tx.recurring_count,
        totalRecurringTransactions: tx.total_recurring_number,
        recurringSeriesId: tx.parent_transaction_id,
        paymentType: tx.payment_type,
        accountId: tx.account_id,
        amount: toDollars(tx.amount)
    });

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransactions(data.map(formatTransaction));
        } catch (error) {
            console.error('Error fetching transactions:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (newTx) => {
        try {
            const transactionData = {
                amount: toCents(newTx.amount),
                category: newTx.category,
                date: newTx.date,
                description: newTx.description,
                type: newTx.type,
                payment_type: newTx.paymentType || 'single',
                user_id: user.id,
                account_id: newTx.accountId
            };

            if (newTx.recurring !== undefined) transactionData.recurring = newTx.recurring;
            if (newTx.recurringSeriesId) transactionData.parent_transaction_id = newTx.recurringSeriesId;
            if (newTx.recurringTransactionCount) transactionData.recurring_count = newTx.recurringTransactionCount;
            if (newTx.totalRecurringTransactions) transactionData.total_recurring_number = newTx.totalRecurringTransactions;

            const { data, error } = await supabase
                .from('transactions')
                .insert([transactionData])
                .select()
                .single();

            if (error) throw error;

            const formattedTx = formatTransaction(data);
            setTransactions(prev => [formattedTx, ...prev]);

            fetchAccounts();
            return { data: formattedTx, error: null };
        } catch (error) {
            console.error('Error adding transaction:', error.message);
            return { data: null, error };
        }
    };

    const addTransactions = async (newTxs) => {
        try {
            const transactionsData = newTxs.map(tx => {
                const data = {
                    amount: toCents(tx.amount),
                    category: tx.category,
                    date: tx.date,
                    description: tx.description,
                    type: tx.type,
                    payment_type: tx.paymentType || 'single',
                    user_id: user.id,
                    account_id: tx.accountId
                };

                if (tx.recurring !== undefined) data.recurring = tx.recurring;
                if (tx.recurringSeriesId) data.parent_transaction_id = tx.recurringSeriesId;
                if (tx.recurringTransactionCount) data.recurring_count = tx.recurringTransactionCount;
                if (tx.totalRecurringTransactions) data.total_recurring_number = tx.totalRecurringTransactions;

                return data;
            });

            const { data, error } = await supabase
                .from('transactions')
                .insert(transactionsData)
                .select();

            if (error) throw error;

            const formattedTxs = data.map(formatTransaction);
            setTransactions(prev => [...formattedTxs, ...prev]);

            fetchAccounts();
            return { data: formattedTxs, error: null };
        } catch (error) {
            console.error('Error adding transactions:', error.message);
            return { data: null, error };
        }
    };

    const updateTransaction = async (updatedTx) => {
        try {
            // Find old transaction to revert balance changes
            const oldTx = transactions.find(t => t.id === updatedTx.id);

            const transactionData = {
                amount: toCents(updatedTx.amount),
                category: updatedTx.category,
                date: updatedTx.date,
                description: updatedTx.description,
                type: updatedTx.type,
                payment_type: updatedTx.paymentType || updatedTx.payment_type,
                account_id: updatedTx.accountId || updatedTx.account_id
            };

            const { data, error } = await supabase
                .from('transactions')
                .update(transactionData)
                .eq('id', updatedTx.id)
                .select()
                .single();

            if (error) throw error;

            const formattedTx = formatTransaction(data);
            setTransactions(prev => prev.map(tx =>
                tx.id === updatedTx.id ? formattedTx : tx
            ));



            fetchAccounts();
            return { data: formattedTx, error: null };
        } catch (error) {
            console.error('Error updating transaction:', error.message);
            return { data: null, error };
        }
    };

    const transferMoney = async ({ fromAccountId, toAccountId, amount, date, description }) => {
        try {
            const fromAccount = accounts.find(a => a.id === fromAccountId);
            const toAccount = accounts.find(a => a.id === toAccountId);
            const transferDescription = description || `${fromAccount?.name} → ${toAccount?.name}`;

            // 1. Create Expense from source account
            const expenseData = {
                amount: toCents(amount),
                category: 'Transfer',
                date: date,
                description: transferDescription,
                type: 'expense',
                payment_type: 'transfer',
                user_id: user.id,
                account_id: fromAccountId
            };

            // 2. Prepare Income to destination account
            const incomeData = {
                amount: toCents(amount),
                category: 'Transfer',
                date: date,
                description: transferDescription,
                type: 'income',
                payment_type: 'transfer',
                user_id: user.id,
                account_id: toAccountId
            };

            const { data: expenseRes, error: expenseErr } = await supabase
                .from('transactions')
                .insert([expenseData])
                .select()
                .single();

            if (expenseErr) throw expenseErr;

            // 2. Create Income to destination account with reference to expense
            const incomeDataFinal = {
                ...incomeData,
                parent_transaction_id: expenseRes.id // Link to expense
            };

            const { data: incomeRes, error: incomeErr } = await supabase
                .from('transactions')
                .insert([incomeDataFinal])
                .select()
                .single();

            if (incomeErr) throw incomeErr;

            // Update local state
            const formattedExp = formatTransaction(expenseRes);
            const formattedInc = formatTransaction(incomeRes);
            setTransactions(prev => [formattedExp, formattedInc, ...prev]);

            fetchAccounts();
            return { error: null };
        } catch (error) {
            console.error('Error during transfer:', error.message);
            return { error };
        }
    };

    const deleteTransaction = async (id) => {
        try {
            const txToDelete = transactions.find(t => t.id === id);
            
            // If it's a transfer, find the twin
            let idsToDelete = [id];
            if (txToDelete?.payment_type === 'transfer') {
                const twin = transactions.find(t => 
                    t.payment_type === 'transfer' && 
                    (t.parent_transaction_id === id || txToDelete.parent_transaction_id === t.id)
                );
                if (twin) idsToDelete.push(twin.id);
            }

            const { error } = await supabase
                .from('transactions')
                .delete()
                .in('id', idsToDelete);

            if (error) throw error;

            setTransactions(prev => prev.filter(tx => !idsToDelete.includes(tx.id)));
            fetchAccounts();
        } catch (error) {
            console.error('Error deleting transaction:', error.message);
        }
    };

    const deleteTransactions = async (ids) => {
        try {
            // Find all twins for the given IDs
            let allIdsToDelete = [...ids];
            transactions.forEach(tx => {
                if (ids.includes(tx.id) && tx.payment_type === 'transfer') {
                    const twin = transactions.find(t => 
                        t.payment_type === 'transfer' && 
                        (t.parent_transaction_id === tx.id || tx.parent_transaction_id === t.id)
                    );
                    if (twin && !allIdsToDelete.includes(twin.id)) {
                        allIdsToDelete.push(twin.id);
                    }
                }
            });

            const { error } = await supabase
                .from('transactions')
                .delete()
                .in('id', allIdsToDelete);

            if (error) throw error;

            setTransactions(prev => prev.filter(tx => !allIdsToDelete.includes(tx.id)));
            fetchAccounts();

        } catch (error) {
            console.error('Error deleting multiple transactions:', error.message);
        }
    };

    // Kept for compatibility, though might be unused or need complex batch update handling
    const updateTransactions = async (updates) => {
        // Supabase doesn't support batch updates easily in one call with different values
        // We'll iterate for now, or use an upsert if they were all new.
        // For simplicity in this migration:
        for (const tx of updates) {
            await updateTransaction(tx);
        }
    };

    return (
        <TransactionsContext.Provider value={{
            transactions,
            loading,
            addTransaction,
            addTransactions,
            updateTransaction,
            deleteTransaction,
            deleteTransactions,
            updateTransactions,
            transferMoney,
            searchTerm,
            setSearchTerm
        }}>
            {children}
        </TransactionsContext.Provider>
    );
};
