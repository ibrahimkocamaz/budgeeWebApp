import React, { createContext, useContext, useState, useEffect } from 'react';

// Initial default categories
const defaultCategories = [
    // Income
    { id: 1, name: 'Salary', iconKey: 'finance', color: '#0aac35', type: 'income' },
    { id: 2, name: 'Freelance', iconKey: 'tech', color: '#2196f3', type: 'income' },
    { id: 3, name: 'Investment', iconKey: 'activity', color: '#4ECDC4', type: 'income' },

    // Expense
    { id: 101, name: 'Food', iconKey: 'food', color: '#FB5607', type: 'expense' },
    { id: 102, name: 'Groceries', iconKey: 'shopping', color: '#F5B041', type: 'expense' },
    { id: 103, name: 'Restaurant', iconKey: 'Utensils', color: '#EC7063', type: 'expense' },
    { id: 104, name: 'Housing', iconKey: 'home', color: '#8E44AD', type: 'expense' },
    { id: 105, name: 'Transport', iconKey: 'car', color: '#5DADE2', type: 'expense' },
    { id: 106, name: 'Entertainment', iconKey: 'film', color: '#FF9800', type: 'expense' },
    { id: 107, name: 'Shopping', iconKey: 'shopping', color: '#E91E63', type: 'expense' },
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
    const [categories, setCategories] = useState(defaultCategories);

    // Initial load from localStorage could go here
    useEffect(() => {
        // Placeholder for local storage logic
        // const saved = localStorage.getItem('categories');
        // if (saved) setCategories(JSON.parse(saved));
    }, []);

    const addCategory = (category) => {
        const newCategory = { ...category, id: Date.now() };
        setCategories(prev => [...prev, newCategory]);
    };

    const updateCategory = (updatedCategory) => {
        setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    };

    const deleteCategory = (id) => {
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    const getCategoriesByType = (type) => {
        return categories.filter(c => c.type === type);
    };

    const value = {
        categories,
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
