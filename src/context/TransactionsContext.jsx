import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { useAccounts } from './AccountsContext';

const TransactionsContext = createContext();

export const useTransactions = () => useContext(TransactionsContext);

export const TransactionsProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const { user } = useAuth();
    const { accounts, updateAccount } = useAccounts();
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
        paymentType: tx.payment_type, // Also often used in frontend
        accountId: tx.account_id
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
                amount: newTx.amount,
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

            // Update Account Balance
            const accountToUpdate = accounts.find(acc => acc.id === newTx.accountId);
            if (accountToUpdate) {
                const amount = parseFloat(newTx.amount);
                const newBalance = newTx.type === 'income'
                    ? parseFloat(accountToUpdate.balance) + amount
                    : parseFloat(accountToUpdate.balance) - amount;

                await updateAccount({ ...accountToUpdate, balance: newBalance });
            }

            return { data: formattedTx, error: null };
        } catch (error) {
            console.error('Error adding transaction:', error.message);
            return { data: null, error };
        }
    };

    const updateTransaction = async (updatedTx) => {
        try {
            // Find old transaction to revert balance changes
            const oldTx = transactions.find(t => t.id === updatedTx.id);

            const transactionData = {
                amount: updatedTx.amount,
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

            // Sync Balances
            if (oldTx) {
                // Revert old transaction effect
                const oldAccount = accounts.find(acc => acc.id === oldTx.accountId);
                if (oldAccount) {
                    let revertedBalance = parseFloat(oldAccount.balance);
                    // If stored account is stale (e.g. edited immediately), maybe risky? 
                    // But we rely on context being relatively fresh.
                    // Ideally we should use the LATEST account state for the second operation if accountId changed.

                    const oldAmount = parseFloat(oldTx.amount);
                    revertedBalance = oldTx.type === 'income'
                        ? revertedBalance - oldAmount
                        : revertedBalance + oldAmount;

                    // If account didn't change, we apply new transaction effect to THIS reverted balance
                    if (oldTx.accountId === (updatedTx.accountId || updatedTx.account_id)) {
                        const newAmount = parseFloat(updatedTx.amount);
                        const finalBalance = updatedTx.type === 'income'
                            ? revertedBalance + newAmount
                            : revertedBalance - newAmount;

                        await updateAccount({ ...oldAccount, balance: finalBalance });
                    } else {
                        // Account Changed! Update Old Account first
                        await updateAccount({ ...oldAccount, balance: revertedBalance });

                        // Then Update New Account
                        const newAccount = accounts.find(acc => acc.id === (updatedTx.accountId || updatedTx.account_id));
                        if (newAccount) {
                            const newAmount = parseFloat(updatedTx.amount);
                            const newAcctBalance = parseFloat(newAccount.balance); // Get fresh(er) balance from context? 
                            // Note: newAccount might be the same object if context didn't update yet, but logic holds.
                            const finalNewBalance = updatedTx.type === 'income'
                                ? newAcctBalance + newAmount
                                : newAcctBalance - newAmount;

                            await updateAccount({ ...newAccount, balance: finalNewBalance });
                        }
                    }
                }
            }

            return { data: formattedTx, error: null };
        } catch (error) {
            console.error('Error updating transaction:', error.message);
            return { data: null, error };
        }
    };

    const deleteTransaction = async (id) => {
        try {
            const txToDelete = transactions.find(t => t.id === id);

            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setTransactions(prev => prev.filter(tx => tx.id !== id));

            // Revert Balance
            if (txToDelete) {
                const account = accounts.find(acc => acc.id === txToDelete.accountId);
                if (account) {
                    const amount = parseFloat(txToDelete.amount);
                    const newBalance = txToDelete.type === 'income'
                        ? parseFloat(account.balance) - amount
                        : parseFloat(account.balance) + amount;

                    await updateAccount({ ...account, balance: newBalance });
                }
            }

        } catch (error) {
            console.error('Error deleting transaction:', error.message);
        }
    };

    const deleteTransactions = async (ids) => {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .in('id', ids);

            if (error) throw error;

            const idSet = new Set(ids);
            setTransactions(prev => prev.filter(tx => !idSet.has(tx.id)));

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
            updateTransaction,
            deleteTransaction,
            deleteTransactions,
            deleteTransactions,
            updateTransactions,
            searchTerm,
            setSearchTerm
        }}>
            {children}
        </TransactionsContext.Provider>
    );
};
