import { Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, Edit2, Trash2, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTransactions } from '../context/TransactionsContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useSettings } from '../context/SettingsContext';
import { useCategories } from '../context/CategoriesContext';
import { useAccounts } from '../context/AccountsContext';
import React, { useState, useMemo, useEffect } from 'react';
import { getCategoryIcon, getCategoryColor } from '../data/categoryOptions';
import ConfirmationModal from './ConfirmationModal';

const Transactions = ({ limit, showControls = true }) => {

    const { t, tCategory, language } = useLanguage();
    const { formatAmount } = useCurrency();
    const { settings } = useSettings();
    const { transactions: allTransactions, deleteTransaction, updateTransaction } = useTransactions();
    const { getCategoriesByType, categories } = useCategories();
    const { accounts } = useAccounts();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const getCategoryIconByName = (name) => {
        const cat = categories.find(c => c.name.toLowerCase() === (name || '').toLowerCase());
        return getCategoryIcon(cat ? cat.icon_key : name);
    };

    const [filter, setFilter] = useState('all'); // all, income, expense
    const [accountFilter, setAccountFilter] = useState(searchParams.get('account') || 'all');
    const [timeFilter, setTimeFilter] = useState('month'); // today, week, month, custom
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    const goToPreviousMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setSelectedDate(newDate);
        setTimeFilter('month');
    };

    const goToNextMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setSelectedDate(newDate);
        setTimeFilter('month');
    };
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, txId: null });
    const [selectedTransaction, setSelectedTransaction] = useState(null);

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
                const startDayMap = { 'sunday': 0, 'monday': 1, 'saturday': 6 };
                const startDay = startDayMap[settings.startOfWeek] || 0; // Default Sunday

                const startOfWeek = new Date(now);
                const currentDay = now.getDay();
                const diff = (currentDay - startDay + 7) % 7;

                startOfWeek.setDate(now.getDate() - diff);
                startOfWeek.setHours(0, 0, 0, 0);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);

                matchesTime = txDate >= startOfWeek && txDate <= endOfWeek;
            } else if (timeFilter === 'month') {
                // Use selectedDate instead of now
                matchesTime = txDate.getMonth() === selectedDate.getMonth() && txDate.getFullYear() === selectedDate.getFullYear();
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
    }, [searchTerm, timeFilter, customDateRange, allTransactions, selectedDate, settings]);

    // 2. Available Categories (Based on Base + Type + Account Filter)
    const availableCategories = useMemo(() => {
        const filtered = baseTransactions.filter(tx => {
            const matchesType = filter === 'all' || tx.type === filter;
            const matchesAccount = accountFilter === 'all' || tx.accountId === accountFilter;
            return matchesType && matchesAccount;
        });

        const categories = [...new Set(filtered.map(tx => tx.category))];
        return categories.sort();
    }, [baseTransactions, filter, accountFilter]);

    // 3. Final Filter (Type + Category + Sort + Limit)
    const filteredTransactions = useMemo(() => {
        let transactions = baseTransactions.filter(tx => {
            const matchesType = filter === 'all' || tx.type === filter;
            const matchesCategory = categoryFilter ? tx.category === categoryFilter : true;
            const matchesAccount = accountFilter === 'all' || tx.accountId === accountFilter;
            return matchesType && matchesCategory && matchesAccount;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (limit) {
            transactions = transactions.slice(0, limit);
        }
        return transactions;
    }, [baseTransactions, filter, categoryFilter, accountFilter, limit]);

    // Reset category filter if it's no longer available
    useEffect(() => {
        if (categoryFilter && !availableCategories.includes(categoryFilter)) {
            setCategoryFilter(null);
        }
    }, [availableCategories, categoryFilter]);

    // Update account filter from URL params
    useEffect(() => {
        const accountId = searchParams.get('account');
        if (accountId) {
            setAccountFilter(accountId);
        }
    }, [searchParams]);

    // Group by Date
    const groupedTransactions = useMemo(() => {
        if (!showControls) {
            return { 'all': filteredTransactions };
        }
        const groups = {};
        filteredTransactions.forEach(tx => {
            const date = new Date(tx.date).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(tx);
        });
        return groups;
    }, [filteredTransactions, showControls]);

    // Create a map for fast category lookup
    const categoryMap = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.name.toLowerCase()] = cat;
            return acc;
        }, {});
    }, [categories]);

    const getRelativeDateLabel = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return t('time.today');
        if (date.toDateString() === yesterday.toDateString()) return t('time.yesterday');
        return date.toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Calculate Totals based on Account and Time filters
    const totals = useMemo(() => {
        return allTransactions.reduce((acc, tx) => {
            // 1. Account Filter
            if (accountFilter !== 'all' && tx.accountId !== accountFilter) {
                return acc;
            }

            // 1.5 Category Filter
            if (categoryFilter && tx.category !== categoryFilter) {
                return acc;
            }

            // 2. Time Filter
            const txDate = new Date(tx.date);
            const now = new Date();
            let matchesTime = true;

            if (timeFilter === 'today') {
                matchesTime = txDate.toDateString() === now.toDateString();
            } else if (timeFilter === 'week') {
                const startDayMap = { 'sunday': 0, 'monday': 1, 'saturday': 6 };
                const startDay = startDayMap[settings.startOfWeek] || 0;

                const startOfWeek = new Date(now);
                const currentDay = now.getDay();
                const diff = (currentDay - startDay + 7) % 7;

                startOfWeek.setDate(now.getDate() - diff);
                startOfWeek.setHours(0, 0, 0, 0);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);

                matchesTime = txDate >= startOfWeek && txDate <= endOfWeek;
            } else if (timeFilter === 'month') {
                matchesTime = txDate.getMonth() === selectedDate.getMonth() &&
                    txDate.getFullYear() === selectedDate.getFullYear();
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

            if (matchesTime) {
                const amount = parseFloat(tx.amount) || 0;
                if (tx.type === 'income') {
                    acc.income += amount;
                } else {
                    acc.expense += amount;
                }
            }
            return acc;
        }, { income: 0, expense: 0 });
    }, [allTransactions, accountFilter, timeFilter, categoryFilter, selectedDate, customDateRange, settings]);

    const currentBalance = totals.income - totals.expense;

    return (
        <div className={`transactions-wrapper ${showControls ? 'full-page' : 'widget-mode'}`}>
            {showControls && (
                <>
                    <div className="page-header">
                        {/* Title removed as per request */}

                        {/* Summary Cards (Moved Here) */}
                        <div className="summary-cards">
                            <div className="summary-card income">
                                <div className="card-label">{t('dashboard.income')}</div>
                                <div className="card-value">+{formatAmount(totals.income)}</div>
                            </div>
                            <div className="summary-card expense">
                                <div className="card-label">{t('dashboard.expenses')}</div>
                                <div className="card-value">-{formatAmount(totals.expense)}</div>
                            </div>
                            <div className="summary-card balance">
                                <div className="card-label">{t('dashboard.balance')}</div>
                                <div className={`card-value ${currentBalance >= 0 ? 'pos' : 'neg'}`}>
                                    {currentBalance >= 0 ? '+' : ''}{formatAmount(currentBalance)}
                                </div>
                            </div>
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
                            <div className={`month-navigator ${timeFilter === 'month' ? 'active' : ''}`}>
                                <button className="nav-btn" onClick={goToPreviousMonth}>
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="current-month-label" onClick={() => setTimeFilter('month')}>
                                    {selectedDate.toLocaleDateString(language, { month: 'long', year: 'numeric' })}
                                </span>
                                <button className="nav-btn" onClick={goToNextMonth}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
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

                            <div className="filter-divider" style={{ margin: '0 8px', height: '20px', alignSelf: 'center', backgroundColor: 'var(--color-divider)', width: '1px' }} />

                            {/* Account Filter (Moved Here) */}
                            <select
                                className="filter-select"
                                value={accountFilter}
                                onChange={(e) => setAccountFilter(e.target.value)}
                            >
                                <option value="all">{t('common.allAccounts') || 'All Accounts'}</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
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

                            {/* Account Filter Removed from here */}

                            {availableCategories.length > 0 && (
                                <>
                                    <div className="filter-divider" />
                                    {availableCategories.map(cat => (
                                        <button
                                            key={cat}
                                            className={`tab ${categoryFilter === cat ? 'active' : ''}`}
                                            onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                                        >
                                            {tCategory(cat)}
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
                        {showControls && <h3 className="date-header">{getRelativeDateLabel(transactions[0].date)}</h3>}
                        <div className="group-items">
                            {transactions.map(tx => {
                                const categoryObj = categoryMap[tx.category.toLowerCase()];
                                const Icon = categoryObj ? getCategoryIcon(categoryObj.icon_key) : getCategoryIcon(tx.category);
                                const color = categoryObj ? categoryObj.color : getCategoryColor(tx.category);
                                const isRecurring = tx.paymentType === 'installment' || tx.recurring === 1;
                                const isEditing = editingId === tx.id;

                                if (isEditing) {
                                    const editModeCategories = getCategoriesByType(editForm.type);

                                    return (
                                        <div key={tx.id} className="transaction-item editing">
                                            <div className="edit-form-container">
                                                <div className="edit-row-top">
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
                                                            <option key={cat.id} value={cat.name.toLowerCase()}>{tCategory(cat.name)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="edit-row-bottom">
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
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={tx.id}
                                        className="transaction-item"
                                        onClick={() => setSelectedTransaction(tx)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div
                                            className="icon-wrapper"
                                            style={{
                                                backgroundColor: color,
                                                color: 'white'
                                            }}
                                        >
                                            <Icon size={24} color="white" />
                                        </div>

                                        <div className="details">
                                            <div className="top-row">
                                                <span className="tx-description">
                                                    {tCategory(tx.category)}
                                                </span>
                                            </div>
                                            <div className="bottom-row">
                                                <span className="tx-category">{tx.description}</span>
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

                                        <div className="amount-container" style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span className={`amount ${tx.type === 'income' ? 'positive' : 'negative'}`}>
                                                {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                                            </span>
                                            {!showControls && (
                                                <span className="tx-date-sub" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>

                                        {showControls && (
                                            <div className="tx-actions">
                                                <button
                                                    className="action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(tx);
                                                    }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(tx.id);
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
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

            {/* Transaction Detail Modal */}
            {selectedTransaction && (
                <div className="modal-overlay" onClick={() => setSelectedTransaction(null)}>
                    <div className="modal-content slide-up transaction-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t('transactions.details') || 'Transaction Details'}</h2>
                            <button className="close-btn" onClick={() => setSelectedTransaction(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="detail-content">
                            <div className="detail-header">
                                <div
                                    className="detail-icon"
                                    style={{
                                        backgroundColor: categoryMap[selectedTransaction.category.toLowerCase()]?.color || getCategoryColor(selectedTransaction.category)
                                    }}
                                >
                                    {(() => {
                                        const cat = categoryMap[selectedTransaction.category.toLowerCase()];
                                        const Icon = cat ? getCategoryIcon(cat.icon_key) : getCategoryIcon(selectedTransaction.category);
                                        return <Icon size={32} color="white" />;
                                    })()}
                                </div>
                                <div className={`detail-amount ${selectedTransaction.type}`}>
                                    {selectedTransaction.type === 'income' ? '+' : '-'}{formatAmount(selectedTransaction.amount)}
                                </div>
                                <div className="detail-date">
                                    {new Date(selectedTransaction.date).toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            <div className="detail-rows">
                                <div className="detail-row">
                                    <span className="label">{t('addTransaction.categoryLabel')}</span>
                                    <span className="value">{tCategory(selectedTransaction.category)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">{t('addTransaction.titleLabel')}</span>
                                    <span className="value">{selectedTransaction.description}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">{t('accounts.typeLabel')}</span>
                                    <span className="value capitalize">{t(`dashboard.${selectedTransaction.type === 'income' ? 'income' : 'expenses'}`) || selectedTransaction.type}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">{t('addTransaction.frequency')}</span>
                                    <span className="value">
                                        {(selectedTransaction.paymentType === 'installment' || selectedTransaction.recurring === 1) ? (
                                            <span className="badge-recurring" style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px' }}>
                                                <RefreshCw size={16} />
                                                {selectedTransaction.recurringTransactionCount && selectedTransaction.totalRecurringTransactions
                                                    ? `${selectedTransaction.recurringTransactionCount}/${selectedTransaction.totalRecurringTransactions}`
                                                    : t('addTransaction.recurring')
                                                }
                                            </span>
                                        ) : (
                                            t('addTransaction.single')
                                        )}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">{t('common.account') || 'Account'}</span>
                                    <span className="value">
                                        {accounts.find(a => a.id === selectedTransaction.accountId)?.name || 'Unknown Account'}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-actions">
                                <button className="action-btn-large edit" onClick={() => {
                                    handleEditClick(selectedTransaction);
                                    setSelectedTransaction(null);
                                }}>
                                    <Edit2 size={18} />
                                    {t('common.edit')}
                                </button>
                                <button className="action-btn-large delete" onClick={() => {
                                    handleDeleteClick(selectedTransaction.id);
                                    setSelectedTransaction(null);
                                }}>
                                    <Trash2 size={18} />
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                    gap: 24px;
                    flex-wrap: wrap;
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

                .summary-cards {
                    display: flex;
                    gap: 12px;
                    /* margin-bottom removed as it is inside header now */
                }

                .summary-card {
                    background-color: var(--bg-card);
                    border: 1px solid var(--color-divider);
                    border-radius: 12px;
                    padding: 8px 12px;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    min-width: 140px;
                }

                .summary-card.income .card-value { color: var(--color-success); }
                .summary-card.expense .card-value { color: var(--color-accent-red); }
                .summary-card.balance .card-value.pos { color: var(--color-brand); }
                .summary-card.balance .card-value.neg { color: var(--text-main); }

                .card-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .card-value {
                    font-size: 0.95rem;
                    font-weight: 700;
                }

                @media (max-width: 600px) {
                    .summary-cards {
                        grid-template-columns: 1fr;
                        gap: 8px;
                    }
                    /* Card is already row based now via main class, so we verify layout */
                    .summary-card {
                        padding: 10px 14px;
                    }
                }

                .time-filters {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    overflow: visible;
                    padding-bottom: 4px;
                    align-items: center;
                }

                .custom-date-wrapper {
                    display: flex;
                    align-items: center;
                }

                .month-navigator {
                    display: flex;
                    align-items: center;
                    background-color: var(--bg-card);
                    border: 1px solid var(--color-divider);
                    border-radius: 8px;
                    padding: 2px;
                    gap: 4px;
                }

                .month-navigator.active {
                     border-color: var(--text-main);
                     background-color: var(--bg-card); /* Keep card bg but highlight border or label */
                }

                .nav-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    border: none;
                    background: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.2s;
                }

                .nav-btn:hover {
                    background-color: rgba(255,255,255,0.05);
                    color: var(--text-main);
                }

                .current-month-label {
                    padding: 0 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-main);
                    cursor: pointer;
                    min-width: 100px;
                    text-align: center;
                }

                .month-navigator.active .current-month-label {
                     color: var(--color-brand);
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
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .filter-select {
                    padding: 8px 12px;
                    border-radius: 20px;
                    background-color: var(--bg-card);
                    border: 1px solid var(--color-divider);
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                    outline: none;
                    flex-shrink: 0;
                }
                
                .filter-select:focus {
                     border-color: var(--text-main);
                     color: var(--text-main);
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
                    width: 48px;
                    height: 48px;
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

                .full-page .transaction-item:not(.editing):hover .amount {
                    transform: translateX(-70px);
                }

                .full-page .transaction-item:not(.editing):hover .tx-actions {
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

                .edit-form-container {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    width: 100%;
                }

                .edit-row-top,
                .edit-row-bottom {
                    display: flex;
                    gap: 8px;
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

                .edit-input.date { width: auto; flex: 1; min-width: 100px; }
                
                /* Fix date picker icon visibility in light mode */
                [data-theme='light'] .edit-input::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
                
                .edit-input.type { width: auto; flex: 1; min-width: 80px; }
                .edit-input.category { width: auto; flex: 1; min-width: 110px; }
                .edit-input.description { flex: 2; min-width: 120px; }
                .edit-input.amount { width: 80px; text-align: right; }

                /* Adjust actions in strict mode */
                .transaction-item.editing .tx-actions {
                    position: static;
                    opacity: 1;
                    pointer-events: auto;
                    transform: none;
                    transition: none;
                    display: flex;
                    gap: 4px;
                }

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

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .modal-content {
                    background: var(--bg-card);
                    width: 100%;
                    max-width: 500px;
                    border-radius: 24px;
                    padding: 24px;
                    border: 1px solid var(--color-divider);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                }

                .slide-up {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .modal-header h2 {
                    font-size: 1.25rem;
                    margin: 0;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                }
                .close-btn:hover { background: var(--bg-app); color: var(--text-main); }

                /* Detail Modal Specifics */
                .detail-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 32px;
                }

                .detail-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
                }

                .detail-amount {
                    font-size: 2rem;
                    font-weight: 700;
                    letter-spacing: -1px;
                }
                .detail-amount.income { color: var(--color-success); }
                .detail-amount.expense { color: var(--text-main); }

                .detail-date {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .detail-rows {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background-color: var(--bg-app);
                    padding: 20px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.95rem;
                }

                .detail-row .label { color: var(--text-muted); }
                .detail-row .value { font-weight: 500; }
                .detail-row .value.capitalize { text-transform: capitalize; }

                .detail-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .action-btn-large {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    border-radius: 12px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.95rem;
                }

                .action-btn-large.edit {
                    background-color: var(--bg-app);
                    color: var(--text-main);
                    border: 1px solid var(--color-divider);
                }
                .action-btn-large.edit:hover { border-color: var(--text-muted); }

                .action-btn-large.delete {
                    background-color: rgba(239, 68, 68, 0.1);
                    color: #ef5350;
                }
                .action-btn-large.delete:hover { background-color: rgba(239, 68, 68, 0.2); }
            `}</style>
        </div>
    );
};

export default Transactions;
