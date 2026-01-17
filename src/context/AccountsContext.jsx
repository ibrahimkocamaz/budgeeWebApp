import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const AccountsContext = createContext();

export const useAccounts = () => useContext(AccountsContext);

export const AccountsProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const isSeeding = useRef(false);

    useEffect(() => {
        if (user) {
            fetchAccounts();
        } else {
            setAccounts([]);
        }
    }, [user]);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (data.length === 0) {
                // Prevent race conditions with ref lock
                if (!isSeeding.current) {
                    isSeeding.current = true;
                    await seedDefaultAccount();
                    isSeeding.current = false;
                }
            } else {
                setAccounts(data);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const seedDefaultAccount = async () => {
        try {
            // Double security: Check DB again to ensure no account exists
            const { count } = await supabase
                .from('accounts')
                .select('*', { count: 'exact', head: true });

            if (count > 0) return;

            const defaultAccount = {
                name: 'Main Account', // Frontend will translate this if needed
                type: 'Cash',
                balance: 0,
                color: '#4caf50',
                icon: 'Wallet',
                user_id: user.id
            };

            const { data, error } = await supabase
                .from('accounts')
                .insert([defaultAccount])
                .select()
                .single();

            if (error) throw error;
            setAccounts([data]);
        } catch (error) {
            console.error('Error seeding default account:', error.message);
        }
    };

    const addAccount = async (newAccount) => {
        try {
            const accountData = {
                name: newAccount.name,
                type: newAccount.type,
                balance: newAccount.balance,
                currency: newAccount.currency,
                color: newAccount.color,
                icon: newAccount.icon,
                user_id: user.id
            };

            const { data, error } = await supabase
                .from('accounts')
                .insert([accountData])
                .select()
                .single();

            if (error) throw error;
            setAccounts(prev => [...prev, data]);
            return { data, error: null };
        } catch (error) {
            console.error('Error adding account:', error.message);
            return { data: null, error };
        }
    };

    const updateAccount = async (updatedAccount) => {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .update({
                    name: updatedAccount.name,
                    type: updatedAccount.type,
                    balance: updatedAccount.balance,
                    currency: updatedAccount.currency,
                    color: updatedAccount.color,
                    icon: updatedAccount.icon
                })
                .eq('id', updatedAccount.id)
                .select()
                .single();

            if (error) throw error;

            setAccounts(prev => prev.map(acc =>
                acc.id === updatedAccount.id ? data : acc
            ));
            return { data, error: null };
        } catch (error) {
            console.error('Error updating account:', error.message);
            return { data: null, error };
        }
    };

    const deleteAccount = async (id) => {
        try {
            if (accounts.length <= 1) {
                console.warn('Cannot delete the only account');
                return { error: 'Cannot delete the only account' };
            }

            const { error } = await supabase
                .from('accounts')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setAccounts(prev => prev.filter(acc => acc.id !== id));
            return { error: null };
        } catch (error) {
            console.error('Error deleting account:', error.message);
        }
    };

    return (
        <AccountsContext.Provider value={{
            accounts,
            loading,
            addAccount,
            updateAccount,
            deleteAccount
        }}>
            {children}
        </AccountsContext.Provider>
    );
};
