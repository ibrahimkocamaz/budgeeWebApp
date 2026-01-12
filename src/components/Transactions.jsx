import { Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, Edit2, Trash2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../context/TransactionsContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCategories } from '../context/CategoriesContext';
import React, { useState, useMemo } from 'react';
import { getCategoryIcon, getCategoryColor } from '../data/categoryOptions';
import ConfirmationModal from './ConfirmationModal';

const Transactions = ({ limit, showControls = true }) => {

    const { t, language } = useLanguage();
    const { formatAmount } = useCurrency();
    const { transactions: allTransactions, deleteTransaction, updateTransaction } = useTransactions();
    const { getCategoriesByType } = useCategories();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // all, income, expense
    const [timeFilter, setTimeFilter] = useState('month'); // today, week, month, custom
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, txId: null });

    // Inline Editing State
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        date: '',
        type: 'expense',
        category: '',
        description: '',
        amount: ''
    });

    const handleEditClick = (tx) => {
        setEditingId(tx.id);
        setEditForm({
            date: tx.date.split('T')[0],
            type: tx.type,
            category: tx.category,
            description: tx.description,
            amount: tx.amount
        });
    };

    const handleSaveEdit = (originalTx) => {
        // Create date object from local date string to preserve the selected day
        const [year, month, day] = editForm.date.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);

        updateTransaction({
            ...originalTx,
            date: localDate.toISOString(),
            type: editForm.type,
            category: editForm.category,
            description: editForm.description,
            amount: editForm.amount
        });
        setEditingId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleDeleteClick = (id) => {
        setDeleteModal({ isOpen: true, txId: id });
    };

    const handleConfirmDelete = () => {
        if (deleteModal.txId) {
            deleteTransaction(deleteModal.txId);
            setDeleteModal({ isOpen: false, txId: null });
        }
    };

    // 1. Base Filter (Time and Search)
    const baseTransactions = useMemo(() => {
        return allTransactions.filter(tx => {
            const matchesSearch =
                tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.category.toLowerCase().includes(searchTerm.toLowerCase());

            // Time Filter Logic
            const txDate = new Date(tx.date);
            const now = new Date();
            let matchesTime = true;

            if (timeFilter === 'today') {
                matchesTime = txDate.toDateString() === now.toDateString();
            } else if (timeFilter === 'week') {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);

                matchesTime = txDate >= startOfWeek && txDate <= endOfWeek;
            } else if (timeFilter === 'month') {
                matchesTime = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
            } else if (timeFilter === 'custom') {
                if (customDateRange.start && customDateRange.end) {
                    const startDate = new Date(customDateRange.start);
                    startDate.setHours(0, 0, 0, 0);
                    const endDate = new Date(customDateRange.end);
                    endDate.setHours(23, 59, 59, 999);
                    matchesTime = txDate >= startDate && txDate <= endDate;
                } else {
                    matchesTime = true;
                }
            }

            return matchesSearch && matchesTime;
        });
    }, [searchTerm, timeFilter, customDateRange, allTransactions]);

    // 2. Available Categories (Based on Base + Type Filter)
    const availableCategories = useMemo(() => {
        const typeFiltered = filter === 'all'
            ? baseTransactions
            : baseTransactions.filter(tx => tx.type === filter);

        const categories = [...new Set(typeFiltered.map(tx => tx.category))];
        return categories.sort();
    }, [baseTransactions, filter]);

    // 3. Final Filter (Type + Category + Sort + Limit)
    const filteredTransactions = useMemo(() => {
        let transactions = baseTransactions.filter(tx => {
            const matchesType = filter === 'all' || tx.type === filter;
            const matchesCategory = categoryFilter ? tx.category === categoryFilter : true;
            return matchesType && matchesCategory;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (limit) {
            transactions = transactions.slice(0, limit);
        }
        return transactions;
    }, [baseTransactions, filter, categoryFilter, limit]);

    // Reset category filter if it's no longer available
    React.useEffect(() => {
        if (categoryFilter && !availableCategories.includes(categoryFilter)) {
            setCategoryFilter(null);
        }
    }, [availableCategories, categoryFilter]);

    // Group by Date
    const groupedTransactions = useMemo(() => {
        const groups = {};
        filteredTransactions.forEach(tx => {
            const date = new Date(tx.date).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(tx);
        });
        return groups;
    }, [filteredTransactions]);

    const getRelativeDateLabel = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return t('time.today');
        if (date.toDateString() === yesterday.toDateString()) return t('time.yesterday');
        return date.toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className={`transactions-wrapper ${showControls ? 'full-page' : 'widget-mode'}`}>
            {showControls && (
                <>
                    <div className="page-header">
                        <div>
                            <h2 className="title">{t('sidebar.transactions')}</h2>
                            <p className="subtitle">{filteredTransactions.length} {t('common.items')}</p>
                        </div>

                        <div className="actions">
                            <div className="search-bar">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder={t('common.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="filters-container">
                        {/* Time Filters */}
                        <div className="time-filters">
                            <button
                                className={`time-btn ${timeFilter === 'month' ? 'active' : ''}`}
                                onClick={() => setTimeFilter('month')}
                            >
                                {t('time.thisMonth')}
                            </button>
                            <button
                                className={`time-btn ${timeFilter === 'week' ? 'active' : ''}`}
                                onClick={() => setTimeFilter('week')}
                            >
                                {t('time.thisWeek')}
                            </button>
                            <button
                                className={`time-btn ${timeFilter === 'today' ? 'active' : ''}`}
                                onClick={() => setTimeFilter('today')}
                            >
                                {t('time.today')}
                            </button>
                            <div className="custom-date-wrapper" style={{ position: 'relative' }}>
                                <button
                                    className={`time-btn ${timeFilter === 'custom' ? 'active' : ''}`}
                                    onClick={() => {
                                        setTimeFilter('custom');
                                        setShowDatePicker(!showDatePicker);
                                    }}
                                >
                                    <Calendar size={14} />
                                    {t('time.custom')}
                                </button>
                                {showDatePicker && (
                                    <div className="date-picker-popover">
                                        <div className="date-input-group">
                                            <label>{t('time.startDate')}</label>
                                            <input
                                                type="date"
                                                value={customDateRange.start}
                                                onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                                            />
                                        </div>
                                        <div className="date-input-group">
                                            <label>{t('time.endDate')}</label>
                                            <input
                                                type="date"
                                                value={customDateRange.end}
                                                onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                                            />
                                        </div>
                                        <button
                                            className="apply-btn"
                                            onClick={() => setShowDatePicker(false)}
                                        >
                                            {t('time.apply')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Type Filters */}
                        <div className="filter-tabs">
                            <button
                                className={`tab ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                {t('dashboard.viewAll')}
                            </button>
                            <button
                                className={`tab ${filter === 'income' ? 'active' : ''}`}
                                onClick={() => setFilter('income')}
                            >
                                {t('dashboard.income')}
                            </button>
                            <button
                                className={`tab ${filter === 'expense' ? 'active' : ''}`}
                                onClick={() => setFilter('expense')}
                            >
                                {t('dashboard.expenses')}
                            </button>

                            {/* Divider and Category Filters */}
                            {availableCategories.length > 0 && (
                                <>
                                    <div className="filter-divider" />
                                    {availableCategories.map(cat => (
                                        <button
                                            key={cat}
                                            className={`tab ${categoryFilter === cat ? 'active' : ''}`}
                                            onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                                        >
                                            {t(`categoryNames.${cat.toLowerCase()}`) || cat}
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className="transactions-list">
                {Object.entries(groupedTransactions).map(([date, transactions]) => (
                    <div key={date} className="date-group">
                        <h3 className="date-header">{getRelativeDateLabel(transactions[0].date)}</h3>
                        <div className="group-items">
                            {transactions.map(tx => {
                                const Icon = getCategoryIcon(tx.category);
                                const isRecurring = tx.paymentType === 'installment' || tx.recurring === 1;
                                const isEditing = editingId === tx.id;

                                if (isEditing) {
                                    const editModeCategories = getCategoriesByType(editForm.type);

                                    return (
                                        <div key={tx.id} className="transaction-item editing">
                                            <div className="edit-form-row">
                                                <input
                                                    type="date"
                                                    className="edit-input date"
                                                    value={editForm.date}
                                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                />
                                                <select
                                                    className="edit-input type"
                                                    value={editForm.type}
                                                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value, category: '' })}
                                                >
                                                    <option value="income">{t('dashboard.income')}</option>
                                                    <option value="expense">{t('dashboard.expenses')}</option>
                                                </select>
                                                <select
                                                    className="edit-input category"
                                                    value={editForm.category}
                                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                >
                                                    <option value="">{t('common.selectCategory') || 'Select Category'}</option>
                                                    {editModeCategories.map(cat => (
                                                        <option key={cat.id} value={cat.name.toLowerCase()}>{t(`categoryNames.${cat.name.toLowerCase()}`) || cat.name}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    className="edit-input description"
                                                    placeholder="Description"
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                />
                                                <input
                                                    type="number"
                                                    className="edit-input amount"
                                                    placeholder="Amount"
                                                    value={editForm.amount}
                                                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                                />
                                                <div className="tx-actions">
                                                    <button className="action-btn save" onClick={() => handleSaveEdit(tx)}>
                                                        <Check size={16} />
                                                    </button>
                                                    <button className="action-btn cancel" onClick={handleCancelEdit}>
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={tx.id} className="transaction-item">
                                        <div
                                            className="icon-wrapper"
                                            style={{
                                                backgroundColor: `${getCategoryColor(tx.category)}20`,
                                                color: getCategoryColor(tx.category)
                                            }}
                                        >
                                            <Icon size={20} />
                                        </div>

                                        <div className="details">
                                            <div className="top-row">
                                                <span className="tx-description">
                                                    {tx.description || t(`categoryNames.${tx.category.toLowerCase()}`) || tx.category}
                                                </span>
                                            </div>
                                            <div className="bottom-row">
                                                <span className="tx-category">{t(`categoryNames.${tx.category.toLowerCase()}`) || tx.category}</span>
                                                {isRecurring && (
                                                    <span className="badge-recurring">
                                                        <RefreshCw size={12} />
                                                        {tx.recurringTransactionCount && tx.totalRecurringTransactions
                                                            ? `${tx.recurringTransactionCount}/${tx.totalRecurringTransactions}`
                                                            : t('addTransaction.recurring')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <span className={`amount ${tx.type === 'income' ? 'positive' : 'negative'}`}>
                                            {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                                        </span>

                                        <div className="tx-actions">
                                            <button
                                                className="action-btn"
                                                onClick={() => handleEditClick(tx)}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDeleteClick(tx.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {filteredTransactions.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Filter size={48} />
                        </div>
                        <p>{t('transactions.emptyTitle')}</p>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, txId: null })}
                onConfirm={handleConfirmDelete}
                title={t('common.deleteConfirmTitle') || 'Delete Transaction'}
                message={t('common.deleteConfirm') || 'Are you sure you want to delete this transaction? This action cannot be undone.'}
            />

            <style>{`
                .transactions-wrapper.full-page {
                    max-width: 100%;
                    margin: 0 auto;
                    padding-bottom: 80px;
                }

                .transactions-wrapper.widget-mode {
                    /* Widget specific styles if needed */
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
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

                .actions {
                    display: flex;
                    gap: 12px;
                }

                .search-bar {
                    background-color: var(--bg-card);
                    border: 1px solid var(--color-input-border);
                    border-radius: 8px;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-muted);
                    width: 200px; /* Or responsive */
                }

                .search-bar input {
                    background: none;
                    border: none;
                    color: var(--text-main);
                    width: 100%;
                    outline: none;
                }

                .filters-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .time-filters {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    overflow: visible;
                    padding-bottom: 4px;
                }

                .time-btn {
                    padding: 6px 12px;
                    border-radius: 8px;
                    background-color: var(--bg-card);
                    border: 1px solid var(--color-divider);
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .time-btn:hover {
                    border-color: var(--text-muted);
                    color: var(--text-main);
                }

                .time-btn.active {
                    background-color: var(--text-main);
                    color: var(--text-inverse);
                    border-color: var(--text-main);
                }

                .custom-date-wrapper {
                    display: inline-block;
                }

                .date-picker-popover {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    width: 280px;
                    background-color: var(--bg-card);
                    border: 1px solid var(--color-divider);
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                    padding: 16px;
                    z-index: 100;
                    margin-top: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .date-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .date-input-group label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .date-input-group input {
                    background-color: var(--bg-card);
                    border: 1px solid var(--color-input-border);
                    border-radius: 6px;
                    padding: 8px;
                    color: var(--text-main);
                    font-size: 0.875rem;
                }

                .apply-btn {
                    background-color: var(--text-main);
                    color: var(--text-inverse);
                    border: none;
                    border-radius: 6px;
                    padding: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 4px;
                    transition: opacity 0.2s;
                    text-align: center;
                }

                .apply-btn:hover {
                    opacity: 0.9;
                }

                .filter-divider {
                    width: 1px;
                    height: 24px;
                    background-color: var(--color-divider);
                    margin: 0 8px;
                    flex-shrink: 0;
                    align-self: center;
                }

                .filter-tabs {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding-bottom: 4px;
                }

                .tab {
                    padding: 8px 16px;
                    border-radius: 20px;
                    border: 1px solid var(--color-divider);
                    background: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    font-weight: 500;
                    white-space: nowrap;
                    transition: all 0.2s;
                }

                .tab:hover {
                    background-color: rgba(255,255,255,0.05);
                }

                .tab.active {
                    background-color: var(--text-main);
                    color: var(--text-inverse);
                    border-color: var(--text-main);
                }

                .date-group {
                    margin-bottom: 24px;
                }

                .date-header {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    margin-bottom: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .group-items {
                    background-color: var(--bg-card);
                    border-radius: 12px;
                    border: 1px solid var(--color-divider);
                    overflow: hidden;
                }

                .widget-mode .group-items {
                     /* Reuse existing styles */
                }

                .transaction-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    border-bottom: 1px solid var(--color-divider);
                    transition: background-color 0.2s;
                    position: relative;
                    overflow: hidden; /* To keep sliding clean */
                }

                .transaction-item:last-child {
                    border-bottom: none;
                }

                .transaction-item:hover {
                    background-color: rgba(0,0,0,0.04);
                }

                .icon-wrapper {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .details {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .top-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .tx-description {
                    font-weight: 500;
                    font-size: 1rem;
                }

                .bottom-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .tx-category {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: capitalize;
                }

                .badge-recurring {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background-color: rgba(255, 193, 7, 0.15); /* Amber tint */
                    color: #FFC107;
                    font-size: 0.7rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 600;
                }

                .amount {
                    font-weight: 600;
                    font-size: 1rem;
                    margin-left: auto; /* Push to right */
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .amount.positive {
                    color: var(--color-success);
                }

                .amount.negative {
                    color: var(--text-main); /* or muted */
                }

                .tx-actions {
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%) translateX(20px);
                    display: flex;
                    gap: 8px;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .transaction-item:not(.editing):hover .amount {
                    transform: translateX(-70px);
                }

                .transaction-item:not(.editing):hover .tx-actions {
                    opacity: 1;
                    transform: translateY(-50%) translateX(0);
                    pointer-events: auto;
                }

                .action-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background-color: rgba(255,255,255,0.1);
                    color: var(--text-main);
                }

                .action-btn.delete:hover {
                    color: #ef4444;
                    background-color: rgba(239, 68, 68, 0.1);
                }

                /* Inline Edit Styles */
                .transaction-item.editing {
                    padding: 12px;
                    border: 1px solid var(--text-main);
                    border-radius: 12px;
                }

                .transaction-item.editing .tx-actions {
                    position: static;
                    opacity: 1;
                    pointer-events: auto;
                    transform: none;
                    transition: none;
                }

                .edit-form-row {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    width: 100%;
                }

                .edit-input {
                    background-color: var(--bg-card);
                    border: 1px solid var(--color-input-border);
                    border-radius: 6px;
                    padding: 8px;
                    color: var(--text-main);
                    font-size: 0.875rem;
                    color-scheme: light dark;
                }

                select.edit-input {
                    background-color: var(--bg-card);
                    color: var(--text-main);
                }

                .edit-input option {
                    background-color: var(--bg-card);
                    color: var(--text-main);
                }

                .edit-input.date { width: 130px; }
                
                /* Fix date picker icon visibility in light mode */
                [data-theme='light'] .edit-input::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
                
                .edit-input.type { width: 100px; }
                .edit-input.category { width: 140px; }
                .edit-input.description { flex: 1; }
                .edit-input.amount { width: 100px; text-align: right; }

                .action-btn.save {
                    color: var(--color-success, #2ecc71);
                }
                .action-btn.save:hover {
                    background-color: rgba(46, 204, 113, 0.1);
                }

                .action-btn.cancel {
                    color: var(--text-muted);
                }
                .action-btn.cancel:hover {
                    background-color: rgba(0,0,0,0.05);
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 48px;
                    color: var(--text-muted);
                    gap: 16px;
                }

                .empty-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background-color: var(--bg-card);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                }
            `}</style>
        </div>
    );
};

export default Transactions;
