import React, { useState } from 'react';
import { Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { categoryIcons } from '../data/categoryOptions';
import CategoryForm from './CategoryForm';

// Initial Mock Data derived from user request + defaults
const initialCategories = [
    // Income
    { id: 1, name: 'Salary', iconKey: 'finance', color: '#0aac35', type: 'income' },
    { id: 2, name: 'Freelance', iconKey: 'tech', color: '#2196f3', type: 'income' },
    { id: 3, name: 'Investment', iconKey: 'activity', color: '#4ECDC4', type: 'income' },

    // Expense
    { id: 101, name: 'Food', iconKey: 'food', color: '#FB5607', type: 'expense' },
    { id: 102, name: 'Groceries', iconKey: 'shopping', color: '#F5B041', type: 'expense' },
    { id: 103, name: 'Restaurant', iconKey: 'Utensils', color: '#EC7063', type: 'expense' }, // Fallback logic test
    { id: 104, name: 'Housing', iconKey: 'home', color: '#8E44AD', type: 'expense' },
    { id: 105, name: 'Transport', iconKey: 'car', color: '#5DADE2', type: 'expense' },
];

const ManageCategories = () => {
    const [categories, setCategories] = useState(initialCategories);
    const [activeTab, setActiveTab] = useState('expense'); // 'income' | 'expense'
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const filteredCategories = categories.filter(c => c.type === activeTab);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this category?')) {
            setCategories(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setShowForm(true);
    };

    const handleSave = (categoryData) => {
        if (editingCategory) {
            setCategories(prev => prev.map(c => c.id === categoryData.id ? categoryData : c));
        } else {
            setCategories(prev => [...prev, categoryData]);
        }
        setShowForm(false);
    };

    return (
        <div className="manage-categories-container">
            <div className="header-tabs">
                <button
                    className={`tab-btn expense ${activeTab === 'expense' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expense')}
                >
                    Expense
                </button>
                <button
                    className={`tab-btn income ${activeTab === 'income' ? 'active' : ''}`}
                    onClick={() => setActiveTab('income')}
                >
                    Income
                </button>
            </div>

            <div className="categories-header">
                <h3>{activeTab === 'expense' ? 'Expense' : 'Income'} Categories</h3>
                <button className="btn-add" onClick={handleAddNew}>
                    <Plus size={18} /> Add
                </button>
            </div>

            <div className="categories-list">
                {filteredCategories.map(cat => {
                    const IconComponent = categoryIcons[cat.iconKey]?.icon || categoryIcons['food'].icon; // Fallback

                    return (
                        <div key={cat.id} className="category-item-card">
                            <div className="cat-icon-circle" style={{ backgroundColor: cat.color }}>
                                <IconComponent size={24} color="white" />
                            </div>
                            <div className="cat-info">
                                <span className="cat-name">{cat.name}</span>
                            </div>
                            <div className="cat-actions">
                                <button className="action-btn edit" onClick={() => handleEdit(cat)}>
                                    <Edit2 size={18} />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDelete(cat.id)}>
                                    <Trash2 size={18} />
                                </button>
                                <div className="drag-handle">
                                    <GripVertical size={20} color="var(--text-muted)" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showForm && (
                <CategoryForm
                    initialData={editingCategory}
                    type={activeTab}
                    onSave={handleSave}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <style>{`
          .manage-categories-container {
            max-width: 800px;
            margin: 0 auto;
          }

          .header-tabs {
            display: flex;
            background-color: var(--bg-card);
            padding: 4px;
            border-radius: 12px;
            margin-bottom: 2rem;
            border: 1px solid var(--color-divider);
          }

          .tab-btn {
            flex: 1;
            padding: 12px;
            border: none;
            background: none;
            color: var(--text-muted);
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .tab-btn.active.expense {
             background-color: #FF5252;
             color: white;
          }
          
          .tab-btn.active.income {
             background-color: #4CAF50;
             color: white;
          }

          .categories-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .categories-header h3 {
             font-size: 1.1rem;
             color: var(--text-muted);
          }

          .btn-add {
            background-color: #4CAF50; /* Default green for add */
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 600;
            cursor: pointer;
          }
           
          /* Adjust Add button color based on tab if desired, keeping green for now as per screenshot */

          .categories-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .category-item-card {
            background-color: var(--bg-card);
            border-radius: 12px;
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            border: 1px solid var(--color-divider);
            transition: transform 0.2s;
          }
          
          .category-item-card:hover {
             transform: translateX(4px);
          }

          .cat-icon-circle {
             width: 48px;
             height: 48px;
             border-radius: 50%;
             display: flex;
             align-items: center;
             justify-content: center;
          }

          .cat-info {
            flex: 1;
          }

          .cat-name {
            font-size: 1.1rem;
            font-weight: 500;
          }

          .cat-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .action-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: none;
            background: none;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            cursor: pointer;
          }

          .action-btn:hover {
            background-color: rgba(255,255,255,0.05);
            color: var(--text-main);
          }
          
          .action-btn.delete:hover {
             color: #FF5252;
             background-color: rgba(255, 82, 82, 0.1);
          }

          .drag-handle {
            margin-left: 0.5rem;
            cursor: grab;
          }
       `}</style>
        </div>
    );
};

export default ManageCategories;
