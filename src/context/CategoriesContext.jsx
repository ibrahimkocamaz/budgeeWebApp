import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

// Initial default categories (fallback or for seeding new users)
const defaultCategories = [
    // Income
    { name: 'Salary', iconKey: 'finance', color: '#0aac35', type: 'income' },
    { name: 'Freelance', iconKey: 'tech', color: '#2196f3', type: 'income' },
    { name: 'Investment', iconKey: 'activity', color: '#4ECDC4', type: 'income' },

    // Expense
    { name: 'Food', iconKey: 'food', color: '#FB5607', type: 'expense' },
    { name: 'Groceries', iconKey: 'groceries', color: '#F5B041', type: 'expense' },
    { name: 'Restaurant', iconKey: 'Utensils', color: '#EC7063', type: 'expense' },
    { name: 'Housing', iconKey: 'home', color: '#8E44AD', type: 'expense' },
    { name: 'Transport', iconKey: 'car', color: '#5DADE2', type: 'expense' },
    { name: 'Entertainment', iconKey: 'film', color: '#FF9800', type: 'expense' },
    { name: 'Shopping', iconKey: 'shopping', color: '#E91E63', type: 'expense' },
];

const CategoriesContext = createContext();

export const useCategories = () => {
    const context = useContext(CategoriesContext);
    if (!context) {
        throw new Error('useCategories must be used within a CategoriesProvider');
    }
    return context;
};

export const CategoriesProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const isSeeding = useRef(false);

    useEffect(() => {
        if (user) {
            fetchCategories();
        } else {
            setCategories([]);
        }
    }, [user]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;

            // Should add a check: if 0 categories, seed defaults?
            if (data.length === 0) {
                if (!isSeeding.current) {
                    isSeeding.current = true;
                    await seedDefaultCategories();
                    isSeeding.current = false;
                }
            } else {
                // Auto-migration: Fix Groceries icon if it's using 'shopping'
                const groceries = data.find(c => c.name === 'Groceries' && c.icon_key === 'shopping');
                if (groceries) {
                    await updateCategory({
                        id: groceries.id,
                        name: groceries.name,
                        iconKey: 'groceries',
                        color: groceries.color,
                        type: groceries.type
                    });
                    // Update local state immediately reflecting the change
                    const updatedData = data.map(c =>
                        c.id === groceries.id ? { ...c, icon_key: 'groceries' } : c
                    );
                    setCategories(updatedData);
                } else {
                    setCategories(data);
                }
            }

        } catch (error) {
            console.error('Error fetching categories:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const seedDefaultCategories = async () => {
        try {
            // Double check to prevent race conditions (useEffect running twice)
            const { count } = await supabase
                .from('categories')
                .select('*', { count: 'exact', head: true });

            if (count > 0) return;

            const categoriesToInsert = defaultCategories.map(c => ({
                name: c.name,
                icon_key: c.iconKey,
                color: c.color,
                type: c.type,
                user_id: user.id
            }));
            const { data, error } = await supabase
                .from('categories')
                .insert(categoriesToInsert)
                .select();

            if (error) throw error;
            setCategories(data);
        } catch (error) {
            console.error('Error seeding categories', error);
        }
    }


    const addCategory = async (category) => {
        try {
            const newCategory = {
                name: category.name,
                icon_key: category.iconKey,
                color: category.color,
                type: category.type,
                user_id: user.id
            };

            const { data, error } = await supabase
                .from('categories')
                .insert([newCategory])
                .select()
                .single();

            if (error) throw error;
            setCategories(prev => [...prev, data]);
            return { data, error: null };

        } catch (error) {
            console.error('Error adding category:', error.message);
            return { data: null, error };
        }
    };

    const updateCategory = async (updatedCategory) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .update({
                    name: updatedCategory.name,
                    icon_key: updatedCategory.iconKey, // Map back if needed
                    color: updatedCategory.color,
                    type: updatedCategory.type
                })
                .eq('id', updatedCategory.id)
                .select()
                .single();

            if (error) throw error;
            setCategories(prev => prev.map(c => c.id === updatedCategory.id ? data : c));
            return { data, error: null };
        } catch (error) {
            console.error('Error updating category:', error.message);
            return { data: null, error };
        }
    };

    const deleteCategory = async (id) => {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting category:', error.message);
        }
    };

    const getCategoriesByType = (type) => {
        return categories.filter(c => c.type === type);
    };

    const value = {
        categories,
        loading,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoriesByType
    };

    return (
        <CategoriesContext.Provider value={value}>
            {children}
        </CategoriesContext.Provider>
    );
};

export default CategoriesContext;
