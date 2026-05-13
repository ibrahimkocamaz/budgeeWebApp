import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('budgee_settings');
        return saved ? JSON.parse(saved) : {
            startOfWeek: 'sunday', // 'sunday', 'monday', 'saturday'
            monthStartDay: 1, // 1-31
            // Add other settings here later
        };
    });

    useEffect(() => {
        localStorage.setItem('budgee_settings', JSON.stringify(settings));
    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const deleteAllData = async (userId) => {
        if (!userId) return { error: 'User ID is required' };

        try {
            // Delete in order of dependencies (though Supabase might handle cascading if configured, 
            // explicit is safer)

            // 1. Transactions
            const { error: txError } = await supabase
                .from('transactions')
                .delete()
                .eq('user_id', userId);
            if (txError) throw txError;

            // 2. Budgets
            const { error: budgetError } = await supabase
                .from('budgets')
                .delete()
                .eq('user_id', userId);
            if (budgetError) throw budgetError;

            // 3. Categories (Except defaults if they are handled strictly, but usually all user-owned cats)
            const { error: catError } = await supabase
                .from('categories')
                .delete()
                .eq('user_id', userId);
            if (catError) throw catError;

            // 4. Accounts
            const { error: accError } = await supabase
                .from('accounts')
                .delete()
                .eq('user_id', userId);
            if (accError) throw accError;

            // Optional: Clear any local storage specific to the app's state if needed
            // localStorage.removeItem('some_key');

            return { success: true };
        } catch (error) {
            console.error('Error deleting all data:', error.message);
            return { error: error.message };
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, deleteAllData }}>
            {children}
        </SettingsContext.Provider>
    );
};
