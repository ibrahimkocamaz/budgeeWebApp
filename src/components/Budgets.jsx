import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCategories } from '../context/CategoriesContext';
import { mockBudgets, mockTransactions } from '../data/mockData';
import { getCategoryIcon, getCategoryColor } from '../data/categoryOptions';

const Budgets = ({ limit, simpleMode = false }) => {
    const { t } = useLanguage();
    const { formatAmount } = useCurrency();
    const { getCategoriesByType } = useCategories();
    const expenseCategories = getCategoriesByType('expense');
    const [budgets, setBudgets] = useState(mockBudgets);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Calculate budget progress
    const budgetsWithProgress = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Helper to check if date is in current week/month/year
        const isInPeriod = (dateStr, period) => {
            const date = new Date(dateStr);
            if (period === 'yearly') {
                return date.getFullYear() === currentYear;
            }
            if (period === 'monthly') {
                return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
            }
            if (period === 'weekly') {
                // Simple current week check (Sun-Sat)
                const oneJan = new Date(currentYear, 0, 1);
                const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
                const currentWeek = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);

                const dateNumberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
                const dateWeek = Math.ceil((date.getDay() + 1 + dateNumberOfDays) / 7);
                return date.getFullYear() === currentYear && currentWeek === dateWeek;
            }
            return false;
        };

        return budgets.map(budget => {
            const spent = mockTransactions
                .filter(tx =>
                    tx.category === budget.category &&
                    tx.type === 'expense' &&
                    isInPeriod(tx.date, budget.period)
                )
                .reduce((sum, tx) => sum + Number(tx.amount), 0);

            const remaining = Math.max(0, budget.amount - spent);
            const percentage = Math.min(100, (spent / budget.amount) * 100);

            return { ...budget, spent, remaining, percentage };
            return { ...budget, spent, remaining, percentage };
        }).sort((a, b) => b.percentage - a.percentage);

        if (limit) {
            return sorted.slice(0, limit);
        }
        return sorted;
    }, [budgets, limit]);

    return (
        <div className={`budgets-container ${simpleMode ? 'widget-mode' : ''}`}>
            {!simpleMode && (
                <div className="page-header">
                    <div>
                        <h2 className="title">{t('sidebar.budgets')}</h2>
                        <p className="subtitle">{budgets.length} {t('sidebar.budgets').toLowerCase()} active</p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={20} />
                        Create Budget
                    </button>
                </div>
            )}

            {budgets.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">
                        <AlertCircle size={40} />
                    </div>
                    <h3>No budgets yet</h3>
                    <p>Create a budget to track your spending.</p>
                </div>
            ) : (
                <div className="budgets-grid">
                    {budgetsWithProgress.map(budget => {
                        const Icon = getCategoryIcon(budget.category);
                        const color = getCategoryColor(budget.category);

                        return (
                            <div key={budget.id} className="budget-card">
                                <div className="card-top">
                                    <div className="budget-header">
                                        <div className="icon-wrapper" style={{ backgroundColor: color }}>
                                            <Icon size={24} color="#FFF" />
                                        </div>
                                        <div className="budget-info">
                                            <h3>{budget.name}</h3>
                                            <span className="period-badge">{budget.period}</span>
                                        </div>
                                    </div>
                                    <div className="budget-actions">
                                        <div className="total-amount">{formatAmount(budget.amount)}</div>
                                        <div className="actions-row">
                                            <button className="action-btn"><Edit2 size={16} /></button>
                                            <button className="action-btn delete"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="progress-section">
                                    <div className="progress-labels">
                                        <span>{formatAmount(budget.spent)}</span>
                                        <span>{Math.round(budget.percentage)}%</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div
                                            className="progress-bar-fill"
                                            style={{
                                                width: `${budget.percentage}%`,
                                                backgroundColor: budget.percentage > 90 ? 'var(--color-cancel)' : color
                                            }}
                                        />
                                    </div>
                                    <div className="remaining-label">
                                        Remaining: <span className="remaining-value">{formatAmount(budget.remaining)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Budget</h2>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>

                        <div className="form-group">
                            <label>Budget Name</label>
                            <input type="text" placeholder="e.g. Groceries" />
                        </div>

                        <div className="form-group">
                            <label>Amount</label>
                            <div className="amount-input">
                                <span className="currency-symbol">₺</span>
                                <input type="number" placeholder="0.00" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Category</label>
                                <select>
                                    <option value="">Select Category</option>
                                    {expenseCategories.map(cat => (
                                        <option key={cat.id} value={cat.name.toLowerCase()}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Period</label>
                                <select>
                                    <option value="monthly">Monthly</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </button>
                            <button className="btn-primary">
                                Create Budget
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                /* ... existing styles ... */
                .budgets-container {
                    max-width: 100%;
                    margin: 0 auto;
                    padding-bottom: 80px;
                }

                .budgets-container.widget-mode {
                    padding-bottom: 0;
                    margin: 0;
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

                .budgets-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
                    gap: 1.5rem;
                }
                
                @media (max-width: 768px) {
                    .budgets-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .budget-card {
                    background-color: var(--bg-card);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid var(--color-divider);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }

                .budget-header {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }

                .icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .budget-info h3 {
                    margin: 0 0 4px 0;
                    font-size: 1.1rem;
                }

                .period-badge {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: capitalize;
                }

                .budget-actions {
                    text-align: right;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 8px;
                }

                .total-amount {
                    font-weight: 700;
                    font-size: 1.1rem;
                }

                .actions-row {
                    display: flex;
                    gap: 8px;
                }

                .action-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px;
                    transition: color 0.2s;
                }

                .action-btn:hover {
                    color: var(--text-main);
                }

                .action-btn.delete:hover {
                    color: var(--color-cancel);
                }

                .progress-section {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .progress-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .progress-bar-bg {
                    height: 8px;
                    background-color: var(--bg-app);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .remaining-label {
                    margin-top: 4px;
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    display: flex;
                    justify-content: space-between;
                }

                .remaining-value {
                    color: var(--color-success);
                    font-weight: 600;
                }

                .empty-state {
                    text-align: center;
                    padding: 48px;
                    background-color: var(--bg-card);
                    border-radius: 16px;
                    border: 1px solid var(--color-divider);
                }

                .empty-icon {
                    width: 64px;
                    height: 64px;
                    background-color: var(--bg-app);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    color: var(--text-muted);
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }

                .modal-content {
                    background-color: var(--bg-card);
                    padding: 24px;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 450px;
                    border: 1px solid var(--color-divider);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
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
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .form-group input, 
                .form-group select {
                    width: 100%;
                    padding: 12px;
                    background-color: var(--bg-app);
                    border: 1px solid var(--color-input-border);
                    border-radius: 8px;
                    color: var(--text-main);
                    font-family: inherit;
                    font-size: 1rem;
                }

                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: var(--color-brand);
                }

                .amount-input {
                    position: relative;
                }

                .amount-input input {
                    padding-left: 36px;
                }

                .currency-symbol {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .form-row {
                    display: flex;
                    gap: 16px;
                }

                .form-row .form-group {
                    flex: 1;
                }

                .modal-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 32px;
                }

                .modal-actions button {
                    flex: 1;
                    padding: 12px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                }

                .btn-secondary {
                    background-color: var(--bg-app);
                    color: var(--text-main);
                }

                .btn-secondary:hover {
                    background-color: var(--color-divider);
                }
            `}</style>
        </div>
    );
};

export default Budgets;
