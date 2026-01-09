import React, { useState } from 'react';
import { Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { categoryIcons } from '../data/categoryOptions';
import { useCategories } from '../context/CategoriesContext';
import { useLanguage } from '../context/LanguageContext';
import CategoryForm from './CategoryForm';

const ManageCategories = () => {
    const { t } = useLanguage();
    const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [activeFormType, setActiveFormType] = useState('expense'); // Needed to start form with correct type
    const [activeTab, setActiveTab] = useState('expense'); // Mobile toggle state

    const expenseCategories = categories.filter(c => c.type === 'expense');
    const incomeCategories = categories.filter(c => c.type === 'income');

    const handleDelete = (id) => {
        if (confirm(t('categories.deleteConfirm'))) {
            deleteCategory(id);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setActiveFormType(category.type);
        setShowForm(true);
    };

    const handleAddNew = (type) => {
        setEditingCategory(null);
        setActiveFormType(type);
        setShowForm(true);
    };

    const handleSave = (categoryData) => {
        if (editingCategory) {
            updateCategory({ ...categoryData, id: editingCategory.id });
        } else {
            addCategory({ ...categoryData, type: activeFormType });
        }
        setShowForm(false);
    };

    const CategoryList = ({ title, items, type, accentColor, className }) => (
        <div className={`category-column ${className}`}>
            <div className="column-header">
                <h3 style={{ color: accentColor }}>{title}</h3>
                <button
                    className="btn-add-mini"
                    style={{ backgroundColor: accentColor }}
                    onClick={() => handleAddNew(type)}
                >
                    <Plus size={16} /> {t('categories.add')}
                </button>
            </div>
            <div className="categories-list">
                {items.map(cat => {
                    const IconComponent = categoryIcons[cat.iconKey]?.icon || categoryIcons['food'].icon;
                    return (
                        <div key={cat.id} className="category-item-card">
                            <div className="cat-icon-circle" style={{ backgroundColor: cat.color }}>
                                <IconComponent size={24} color="white" />
                            </div>
                            <div className="cat-info">
                                <span className="cat-name">{t(`categoryNames.${cat.name.toLowerCase()}`) || cat.name}</span>
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
        </div>
    );

    return (
        <div className="manage-categories-container">
            <div className="page-header">
                <div>
                    <h2 className="title">{t('sidebar.categories')}</h2>
                    <p className="subtitle">{t('categories.subtitle')}</p>
                </div>
            </div>

            <div className="header-tabs mobile-only">
                <button
                    className={`tab-btn expense ${activeTab === 'expense' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expense')}
                >
                    {t('categories.expense')}
                </button>
                <button
                    className={`tab-btn income ${activeTab === 'income' ? 'active' : ''}`}
                    onClick={() => setActiveTab('income')}
                >
                    {t('categories.income')}
                </button>
            </div>

            <div className="split-grid">
                <CategoryList
                    title={t('categories.expense')}
                    items={expenseCategories}
                    type="expense"
                    accentColor="#FF5252"
                    className={activeTab === 'expense' ? 'show-mobile' : 'hide-mobile'}
                />
                <CategoryList
                    title={t('categories.income')}
                    items={incomeCategories}
                    type="income"
                    accentColor="#4CAF50"
                    className={activeTab === 'income' ? 'show-mobile' : 'hide-mobile'}
                />
            </div>

            {showForm && (
                <CategoryForm
                    initialData={editingCategory}
                    type={activeFormType}
                    onSave={handleSave}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <style>{`
          .manage-categories-container {
            max-width: 100%;
            margin: 0 auto;
          }

          .page-header {
             margin-bottom: 24px;
          }

          .title {
             font-size: 1.5rem;
             font-weight: 700;
             margin-bottom: 4px;
          }

          .subtitle {
             color: var(--text-muted);
             font-size: 0.875rem;
          }

          /* Mobile Tabs */
          .header-tabs {
            display: flex;
            background-color: var(--bg-card);
            padding: 4px;
            border-radius: 12px;
            margin-bottom: 1.5rem;
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

          .mobile-only {
              display: none;
          }

          .split-grid {
             display: grid;
             grid-template-columns: 1fr 1fr;
             gap: 2rem;
             align-items: start;
          }

          @media (max-width: 768px) {
             .mobile-only {
                 display: flex;
             }
          
             .split-grid {
                display: block; /* Stack or just rely on hiding */
             }

             /* Hide column based on active tab state class */
             .category-column.hide-mobile {
                 display: none;
             }
             
             .category-column.show-mobile {
                 display: flex;
             }
          }

          .category-column {
             display: flex;
             flex-direction: column;
             gap: 1rem;
          }

          .column-header {
             display: flex;
             justify-content: space-between;
             align-items: center;
             padding-bottom: 0.5rem;
             border-bottom: 1px solid var(--color-divider);
             margin-bottom: 0.5rem;
          }

          .column-header h3 {
             font-size: 1.1rem;
             font-weight: 600;
          }

          .btn-add-mini {
             border: none;
             color: white;
             padding: 6px 12px;
             border-radius: 12px;
             font-size: 0.8rem;
             font-weight: 600;
             display: flex;
             align-items: center;
             gap: 4px;
             cursor: pointer;
             transition: opacity 0.2s;
          }
          
          .btn-add-mini:hover {
             opacity: 0.9;
          }

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
            font-size: 1rem;
            font-weight: 500;
          }

          .cat-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .action-btn {
            width: 32px;
            height: 32px;
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
          
          .action-btn.edit:hover {
            color: var(--color-brand);
            background-color: rgba(59, 130, 246, 0.1);
          }

          .action-btn.delete:hover {
             color: #FF5252;
             background-color: rgba(255, 82, 82, 0.1);
          }

          .drag-handle {
            margin-left: 0.25rem;
            cursor: grab;
            opacity: 0.5;
          }
          
          .drag-handle:hover {
            opacity: 1;
          }
       `}</style>
        </div>
    );
};

export default ManageCategories;
