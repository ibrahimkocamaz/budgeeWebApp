import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCategories } from '../context/CategoriesContext';
import { useBudgets } from '../context/BudgetsContext';
import { useTransactions } from '../context/TransactionsContext';
import { useSettings } from '../context/SettingsContext';
import { getCategoryIcon, getCategoryColor } from '../data/categoryOptions';
import ConfirmationModal from './ConfirmationModal';

const Budgets = ({ limit, simpleMode = false }) => {
    const { t, tCategory } = useLanguage();
    const { formatAmount } = useCurrency();
    const { getCategoriesByType, categories } = useCategories();
    const { budgets, deleteBudget, addBudget, updateBudget, modalState, openModal, closeModal } = useBudgets();
    const { transactions } = useTransactions();
    const { settings } = useSettings();
    const expenseCategories = getCategoriesByType('expense');

    // const [budgets, setBudgets] = useState(mockBudgets); // REPLACED BY CONTEXT
    // Local modal state removed - using context

    // Form State (we need to control inputs to pre-fill them)
    const [formData, setFormData] = useState({ amount: '', category: '', period: 'monthly' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, budgetId: null });

    // Sync formData when modal opens for editing
    React.useEffect(() => {
        if (modalState.isOpen && modalState.mode === 'edit' && modalState.budget) {
            setFormData({
                amount: modalState.budget.amount,
                category: modalState.budget.category,
                period: modalState.budget.period
            });
        } else if (modalState.isOpen && modalState.mode === 'create') {
            // Reset form when opening create modal
            setFormData({ amount: '', category: '', period: 'monthly' });
        }
    }, [modalState.isOpen, modalState.mode, modalState.budget]);


    const handleDeleteClick = (id) => {
        setDeleteModal({ isOpen: true, budgetId: id });
    };

    const handleEditClick = (budget) => {
        // Form data is set via useEffect now or we can set it here directly if preferred, 
        // but context only holds the budget reference.
        // Let's rely on the useEffect for cleaner separation or set it here to be safe.
        // Actually, setting it here is safer for immediate UI update before effect runs.
        setFormData({
            amount: budget.amount,
            category: budget.category,
            period: budget.period
        });
        openModal('edit', budget);
    };

    const handleCreateClick = () => {
        // setFormData via useEffect or manual clear
        setFormData({ amount: '', category: '', period: 'monthly' });
        openModal('create');
    };

    const handleSaveBudget = () => {
        if (!formData.amount || !formData.category) return; // Basic validation

        const budgetData = {
            id: modalState.mode === 'edit' ? modalState.budget.id : Date.now(),
            amount: Number(formData.amount),
            category: formData.category,
            period: formData.period,
            // Logic for spent/remaining happens in useMemo or backend, data just stores config
        };

        if (modalState.mode === 'edit') {
            updateBudget(budgetData);
        } else {
            addBudget(budgetData);
        }
        closeModal();
    };

    const handleConfirmDelete = () => {
        if (deleteModal.budgetId) {
            deleteBudget(deleteModal.budgetId);
            setDeleteModal({ isOpen: false, budgetId: null });
        }
    };

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
                const startDayMap = { 'sunday': 0, 'monday': 1, 'saturday': 6 };
                const startDay = startDayMap[settings.startOfWeek] || 0;

                // Current Week Range
                const startOfWeek = new Date(now);
                const currentDay = now.getDay();
                const diff = (currentDay - startDay + 7) % 7;
                startOfWeek.setDate(now.getDate() - diff);
                startOfWeek.setHours(0, 0, 0, 0);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);

                return date >= startOfWeek && date <= endOfWeek;
            }
            return false;
        };

        const sorted = budgets.map(budget => {
            const spent = transactions
                .filter(tx =>
                    tx.category === budget.category &&
                    tx.type === 'expense' &&
                    isInPeriod(tx.date, budget.period)
                )
                .reduce((sum, tx) => sum + Number(tx.amount), 0);

            const rawRemaining = budget.amount - spent;
            const remaining = Math.max(0, rawRemaining);
            const overspent = rawRemaining < 0 ? Math.abs(rawRemaining) : 0;
            const percentage = Math.min(100, (spent / budget.amount) * 100);

            return { ...budget, spent, remaining, overspent, percentage };
        }).sort((a, b) => b.percentage - a.percentage);

        if (limit) {
            return sorted.slice(0, limit);
        }
        return sorted;
    }, [budgets, limit, transactions]);

    return (
        <div className={`budgets-container ${simpleMode ? 'widget-mode' : ''}`}>

            {budgets.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">
                        <AlertCircle size={40} />
                    </div>
                    <h3>{t('budgets.emptyTitle')}</h3>
                    <p>{t('budgets.emptyDesc')}</p>
                </div>
            ) : (
                <div className="budgets-grid">
                    {budgetsWithProgress.map(budget => {
                        const categoryObj = categories.find(c => c.name.toLowerCase() === budget.category.toLowerCase());
                        const Icon = categoryObj ? getCategoryIcon(categoryObj.icon_key) : getCategoryIcon(budget.category);
                        const color = categoryObj ? categoryObj.color : getCategoryColor(budget.category);

                        let progressColor = 'var(--color-success)';
                        if (budget.percentage > 90) {
                            progressColor = 'var(--color-cancel)';
                        } else if (budget.percentage > 80) {
                            progressColor = 'var(--color-warning)';
                        }

                        if (simpleMode) {
                            return (
                                <div key={budget.id} className="budget-card widget-card">
                                    {/* Row 1: Icon | Name (Pct) | Progress Bar */}
                                    <div className="widget-row-1">
                                        <div className="widget-header-left">
                                            <div className="icon-wrapper small" style={{ backgroundColor: color }}>
                                                <Icon size={16} color="#FFF" />
                                            </div>
                                            <span className="budget-name-widget">{tCategory(budget.category)} <span className="pct-text">({Math.round(budget.percentage)}%)</span></span>
                                        </div>
                                        <div className="widget-progress-wrapper">
                                            <div className="progress-bar-bg small">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{
                                                        width: `${budget.percentage}%`,
                                                        backgroundColor: progressColor
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 2: Spent/Total | Remaining */}
                                    <div className="widget-row-2">
                                        <div className="stat-group">
                                            <span className="spent">{formatAmount(budget.spent)}</span>
                                            <span className="sep">/</span>
                                            <span className="total">{formatAmount(budget.amount)}</span>
                                        </div>
                                        <div className="stat-group right">
                                            <span
                                                className="remaining"
                                                style={{ color: budget.overspent > 0 ? 'var(--color-cancel)' : 'var(--color-success)' }}
                                            >
                                                {budget.overspent > 0
                                                    ? `+ ${formatAmount(budget.overspent)}`
                                                    : formatAmount(budget.remaining)
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={budget.id} className="budget-card">
                                <div className="card-top">
                                    <div className="budget-header">
                                        <div className="icon-wrapper" style={{ backgroundColor: color }}>
                                            <Icon size={24} color="#FFF" />
                                        </div>
                                        <div className="budget-info">
                                            <h3>{tCategory(budget.category)}</h3>
                                            <span className="period-badge">{t(`budgets.periods.${budget.period}`) || budget.period}</span>
                                        </div>
                                    </div>
                                    <div className="budget-actions">
                                        <div className="total-amount">
                                            {formatAmount(budget.amount)}
                                        </div>
                                        <div className="actions-row">
                                            <button
                                                className="action-btn"
                                                onClick={() => handleEditClick(budget)}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDeleteClick(budget.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
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
                                                backgroundColor: progressColor
                                            }}
                                        />
                                    </div>
                                    <div className="remaining-label">
                                        {t('budgets.remaining')}
                                        <span
                                            className="remaining-value"
                                            style={{ color: budget.overspent > 0 ? 'var(--color-cancel)' : 'var(--color-success)' }}
                                        >
                                            {budget.overspent > 0
                                                ? `+ ${formatAmount(budget.overspent)}`
                                                : formatAmount(budget.remaining)
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}



            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, budgetId: null })}
                onConfirm={handleConfirmDelete}
                title={t('budgets.deleteConfirmTitle') || t('common.deleteConfirmTitle')}
                message={t('budgets.deleteConfirm') || t('common.deleteConfirm')}
            />

            {modalState.isOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalState.mode === 'edit' ? (t('budgets.editModalTitle') || 'Edit Budget') : t('budgets.createModalTitle')}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>

                        <div className="form-group">
                            <label>{t('budgets.amountLabel')}</label>
                            <div className="amount-input">
                                <span className="currency-symbol">₺</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{t('budgets.categoryLabel')}</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">{t('budgets.selectCategory')}</option>
                                    {expenseCategories.map(cat => (
                                        <option key={cat.id} value={cat.name.toLowerCase()}>
                                            {tCategory(cat.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t('budgets.periodLabel')}</label>
                                <select
                                    value={formData.period}
                                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                >
                                    <option value="monthly">{t('budgets.periods.monthly')}</option>
                                    <option value="weekly">{t('budgets.periods.weekly')}</option>
                                    <option value="yearly">{t('budgets.periods.yearly')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={closeModal}
                            >
                                {t('common.cancel')}
                            </button>
                            <button className="btn-primary" onClick={handleSaveBudget}>
                                {modalState.mode === 'edit' ? (t('common.save') || 'Save') : t('budgets.create')}
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
                }

                /* --- Strict Widget Mode Styles --- */
                .budgets-container.widget-mode {
                    width: 100%;
                    margin: 0;
                    padding-bottom: 0;
                }

                .budgets-container.widget-mode .budgets-grid {
                    grid-template-columns: 1fr;
                    gap: 8px;
                    width: 100%;
                }

                .budgets-container.widget-mode .budget-card.widget-card {
                     padding: 12px 14px;
                     gap: 8px;
                     display: flex;
                     flex-direction: column;
                }
                
                /* Row 1: Icon + Name(%) ... Progress Bar */
                .widget-row-1 {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    width: 100%;
                }
                
                .widget-header-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .icon-wrapper.small {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                .budget-name-widget {
                    font-size: 0.9rem;
                    font-weight: 600;
                    white-space: nowrap;
                    margin: 0;
                }
                
                .pct-text {
                    color: var(--text-muted);
                    font-weight: normal;
                    margin-left: 4px;
                }
                
                .widget-progress-wrapper {
                    flex: 1; /* Fill remaining space */
                    display: flex;
                    align-items: center;
                    min-width: 60px; /* Ensure some bar always shows */
                }
                
                .progress-bar-bg.small {
                    height: 6px;
                    background-color: var(--bg-app);
                    border-radius: 3px;
                    overflow: hidden;
                    width: 100%;
                }

                /* Row 2: Spent/Total | Remaining */
                .widget-row-2 {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.85rem; /* Slightly larger for readability */
                    color: var(--text-main);
                }
                
                .widget-row-2 .stat-group {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                }
                
                .widget-row-2 .spent {
                    font-weight: 600;
                }
                
                .widget-row-2 .sep,
                .widget-row-2 .total {
                    color: var(--text-muted);
                    font-size: 0.95em;
                }
                
                .widget-row-2 .remaining {
                    font-weight: 600;
                }
                
                .budgets-container.widget-mode .total-amount {
                    font-size: 0.9rem;
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
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
                    flex-shrink: 0;
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
