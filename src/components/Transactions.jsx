import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, Edit2, Trash2 } from 'lucide-react';
import { mockTransactions } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { getCategoryIcon, getCategoryColor } from '../data/categoryOptions';

const Transactions = ({ limit, showControls = true }) => {
    const { t } = useLanguage();
    const { formatAmount } = useCurrency();
    const [filter, setFilter] = useState('all'); // all, income, expense
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTransactions = useMemo(() => {
        let transactions = mockTransactions.filter(tx => {
            const matchesFilter = filter === 'all' || tx.type === filter;
            const matchesSearch =
                tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.category.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (limit) {
            transactions = transactions.slice(0, limit);
        }
        return transactions;
    }, [filter, searchTerm, limit]);

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

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className={`transactions-wrapper ${showControls ? 'full-page' : 'widget-mode'}`}>
            {showControls && (
                <>
                    <div className="page-header">
                        <div>
                            <h2 className="title">{t('sidebar.transactions')}</h2>
                            <p className="subtitle">{filteredTransactions.length} items</p>
                        </div>

                        <div className="actions">
                            <div className="search-bar">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

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
                                                    {tx.description || t(`categories.${tx.category}`) || tx.category}
                                                </span>
                                            </div>
                                            <div className="bottom-row">
                                                <span className="tx-category">{tx.category}</span>
                                                {isRecurring && (
                                                    <span className="badge-recurring">
                                                        <RefreshCw size={12} />
                                                        {tx.recurringTransactionCount && tx.totalRecurringTransactions
                                                            ? `${tx.recurringTransactionCount}/${tx.totalRecurringTransactions}`
                                                            : 'Recurring'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className={`amount ${tx.type === 'income' ? 'positive' : 'negative'}`}>
                                            {tx.type === 'income' ? '+' : '-'}
                                            {formatAmount(tx.amount)}
                                        </div>

                                        <div className="tx-actions">
                                            <button className="action-btn edit" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="action-btn delete" title="Delete">
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
                        <p>No transactions found</p>
                    </div>
                )}
            </div>

            <style>{`
                .transactions-wrapper.full-page {
                    max-width: 800px;
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

                .filter-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
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

                /* Widget Mode Overrides for group items to fit dashboard if needed */
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
                    background-color: rgba(255,255,255,0.02);
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

                .transaction-item:hover .amount {
                    transform: translateX(-70px);
                }

                .transaction-item:hover .tx-actions {
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
                    background-color: rgba(220, 38, 38, 0.1);
                    color: var(--color-accent-red);
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
