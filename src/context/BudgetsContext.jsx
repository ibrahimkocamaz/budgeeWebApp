import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const BudgetsContext = createContext();

export const useBudgets = () => useContext(BudgetsContext);

export const BudgetsProvider = ({ children }) => {
    const [budgets, setBudgets] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchBudgets();
        } else {
            setBudgets([]);
        }
    }, [user]);

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('budgets')
                .select('*');

            if (error) throw error;
            setBudgets(data);
        } catch (error) {
            console.error('Error fetching budgets:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const addBudget = async (newBudget) => {
        try {
            const budgetData = {
                category: newBudget.category,
                amount: newBudget.amount,
                period: newBudget.period,
                color: newBudget.color,
                user_id: user.id
            };

            const { data, error } = await supabase
                .from('budgets')
                .insert([budgetData])
                .select()
                .single();

            if (error) throw error;
            setBudgets(prev => [data, ...prev]);
            return { data, error: null };
        } catch (error) {
            console.error('Error adding budget:', error.message);
            return { data: null, error };
        }
    };

    const updateBudget = async (updatedBudget) => {
        try {
            const { data, error } = await supabase
                .from('budgets')
                .update({
                    category: updatedBudget.category,
                    amount: updatedBudget.amount,
                    period: updatedBudget.period,
                    color: updatedBudget.color,
                })
                .eq('id', updatedBudget.id)
                .select()
                .single();

            if (error) throw error;
            setBudgets(prev => prev.map(budget =>
                budget.id === updatedBudget.id ? data : budget
            ));
            return { data, error: null };
        } catch (error) {
            console.error('Error updating budget:', error.message);
            return { data: null, error };
        }
    };

    const deleteBudget = async (id) => {
        try {
            const { error } = await supabase
                .from('budgets')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setBudgets(prev => prev.filter(budget => budget.id !== id));
        } catch (error) {
            console.error('Error deleting budget:', error.message);
        }
    };

    return (
        <BudgetsContext.Provider value={{
            budgets,
            loading,
            addBudget,
            updateBudget,
            deleteBudget
        }}>
            {children}
        </BudgetsContext.Provider>
    );
};
