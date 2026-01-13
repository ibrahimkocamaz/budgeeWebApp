import React, { useMemo, useState } from 'react';
import { useTransactions } from '../context/TransactionsContext';
import { useCategories } from '../context/CategoriesContext';
import { useRecurringSeries } from '../hooks/useRecurringSeries';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { getCategoryIcon, getCategoryColor as getDefaultCategoryColor } from '../data/categoryOptions';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const RecurringTransactions = () => {
    const { deleteTransactions, updateTransactions } = useTransactions();
    const { categories } = useCategories();
    const { t } = useLanguage();
    const { formatAmount } = useCurrency();
    const [editingSeriesId, setEditingSeriesId] = useState(null);
    const [editAmount, setEditAmount] = useState('');

    const recurringSeries = useRecurringSeries();

    const getCategoryColor = (name) => {
        const cat = categories.find(c => c.name.toLowerCase() === (name || '').toLowerCase());
        return cat ? cat.color : getDefaultCategoryColor(name);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const [confirmModal, setConfirmModal] = useState({ show: false, series: null });

    const handleCancelSeries = (series) => {
        setConfirmModal({
            show: true,
            series: series,
            message: t('recurring.cancelConfirm') || "Are you sure you want to cancel future transactions for this series? This cannot be undone."
        });
    };

    const confirmCancel = () => {
        if (confirmModal.series) {
            const now = new Date();
            const futureTxs = confirmModal.series.transactions.filter(tx => new Date(tx.date) > now);
            if (futureTxs.length > 0) {
                deleteTransactions(futureTxs.map(tx => tx.id));
            }
        }
        setConfirmModal({ show: false, series: null });
    };

    const startEdit = (series) => {
        setEditingSeriesId(series.id);
        setEditAmount(series.amount);
    };

    const saveEdit = (series) => {
        const newAmt = parseFloat(editAmount);
        if (isNaN(newAmt)) return;

        const now = new Date();
        const futureTxs = series.transactions.filter(tx => new Date(tx.date) > now);

        if (futureTxs.length > 0) {
            const updates = futureTxs.map(tx => ({
                ...tx,
                amount: newAmt.toString()
            }));
            updateTransactions(updates);
        }
        setEditingSeriesId(null);
    };

    return (
        <div className="recurring-container">
            {recurringSeries.length === 0 ? (
                <div className="empty-state">
                    <Clock size={48} className="empty-icon" />
                    <h3>{t('recurring.noRecurringTitle')}</h3>
                    <p>{t('recurring.noRecurringDesc')}</p>
                </div>
            ) : (
                <div className="series-grid">
                    {recurringSeries.map(series => (
                        <div key={series.id} className={`series-card ${series.isCompleted ? 'completed' : ''}`}>
                            <div className="series-header">
                                <div className="series-icon" style={{ backgroundColor: getCategoryColor(series.category) }}>
                                    {React.createElement(getCategoryIcon(series.category), { size: 24, color: 'white' })}
                                </div>
                                <div className="series-info">
                                    <h3>{series.description}</h3>
                                    <span className="series-category">
                                        {t(`categoryNames.${(series.category || '').toLowerCase()}`) || series.category}
                                        {series.frequency && (
                                            <>
                                                <span className="separator">•</span>
                                                <span className="capitalize">{t(`addTransaction.${series.frequency}`) || series.frequency}</span>
                                            </>
                                        )}
                                    </span>
                                </div>
                                <div className={`series-amount ${series.type}`}>
                                    {series.type === 'income' ? '+' : '-'}{formatAmount(series.amount)}
                                </div>
                            </div>

                            <div className="series-progress">
                                <div className="progress-info">
                                    <span>{t('recurring.progress')}</span>
                                    <span>{series.paidCount} / {series.totalCount}</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div
                                        className="progress-bar-fill"
                                        style={{
                                            width: `${(series.paidCount / Math.max(series.totalCount, 1)) * 100}%`,
                                            backgroundColor: getCategoryColor(series.category)
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="series-details">
                                <div className="detail-item">
                                    <span className="label">{t('recurring.nextDue')}</span>
                                    <span className="value">
                                        {series.isCompleted ?
                                            <span className="status-badge completed">{t('recurring.completed')}</span> :
                                            formatDate(series.nextDueDate)
                                        }
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">{t('recurring.remaining')}</span>
                                    <span className="value">{formatAmount(series.remainingAmount)}</span>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            {!series.isCompleted && (
                                <div className="series-actions">
                                    {editingSeriesId === series.id ? (
                                        <div className="edit-mode-actions">
                                            <input
                                                type="number"
                                                value={editAmount}
                                                onChange={(e) => setEditAmount(e.target.value)}
                                                className="edit-amount-input"
                                                placeholder="New Amount"
                                            />
                                            <button className="action-btn save" onClick={() => saveEdit(series)}>Save</button>
                                            <button className="action-btn cancel" onClick={() => setEditingSeriesId(null)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            <button className="text-btn" onClick={() => startEdit(series)}>
                                                {t('common.edit') || 'Edit Future Price'}
                                            </button>
                                            <button className="text-btn destructive" onClick={() => handleCancelSeries(series)}>
                                                {t('common.cancel') || 'Cancel Series'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .recurring-container {
                    max-width: 100%;
                    margin: 0 auto;
                    padding-bottom: 2rem;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 2rem;
                    color: var(--text-muted);
                    text-align: center;
                }

                .empty-icon {
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }

                .series-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .series-card {
                    background-color: var(--bg-card);
                    border: 1px solid var(--color-divider);
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem; /* Reduced gap since we added actions */
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .series-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    transform: translateY(-2px);
                }

                .series-card.completed {
                    opacity: 0.7;
                    background-color: var(--bg-app);
                }

                .series-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .series-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .series-info {
                    flex: 1;
                    overflow: hidden;
                }

                .series-info h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0 0 4px 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .series-category {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .separator { margin: 0 2px; opacity: 0.5; }
                .capitalize { text-transform: capitalize; }

                .series-amount {
                    font-weight: 700;
                    font-size: 1.1rem;
                }
                .series-amount.income { color: var(--color-success); }
                .series-amount.expense { color: var(--text-main); }

                .series-progress {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .progress-bar-bg {
                    height: 8px;
                    background-color: var(--bg-app);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    background-color: var(--color-brand);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .series-details {
                    display: flex;
                    justify-content: space-between;
                    padding-top: 1rem;
                    border-top: 1px solid var(--color-divider);
                }

                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .detail-item .label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .detail-item .value {
                    font-weight: 600;
                    font-size: 0.95rem;
                }

                .status-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .status-badge.completed {
                    background-color: var(--color-success);
                    color: white;
                }

                /* Actions */
                .series-actions {
                    border-top: 1px solid var(--color-divider);
                    padding-top: 1rem;
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    justify-content: flex-end;
                }
                
                .text-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                
                .text-btn:hover {
                    color: var(--text-main);
                    background-color: var(--bg-app);
                }
                
                .text-btn.destructive:hover {
                    color: var(--color-cancel);
                    background-color: rgba(244, 67, 54, 0.1);
                }

                .edit-mode-actions {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    width: 100%;
                    justify-content: flex-start;
                }

                .edit-amount-input {
                    width: 100px; /* Fixed width instead of flex: 1 */
                    padding: 6px;
                    border-radius: 6px;
                    border: 1px solid var(--color-brand);
                    background-color: var(--bg-app);
                    color: var(--text-main);
                    font-size: 0.9rem;
                }

                .action-btn {
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                }
                
                .action-btn.save {
                    background-color: var(--color-brand);
                    color: white;
                    margin-left: auto;
                }
                
                .action-btn.cancel {
                    background-color: transparent;
                    color: var(--text-muted);
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(2px);
                }

                .modal-content {
                    background-color: var(--bg-card);
                    padding: 1.5rem;
                    border-radius: 12px;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    border: 1px solid var(--color-divider);
                }

                .modal-header {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .modal-body {
                    color: var(--text-muted);
                    font-size: 0.95rem;
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                .modal-btn {
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    border: none;
                    transition: opacity 0.2s;
                }
                .modal-btn:hover { opacity: 0.8; }

                .modal-btn.secondary {
                    background-color: transparent;
                    color: var(--text-muted);
                }
                .modal-btn.primary {
                    background-color: var(--color-cancel); /* Using cancel color for destructive action */
                    color: white;
                }
            `}</style>

            {confirmModal.show && (
                <div className="modal-overlay" onClick={() => setConfirmModal({ show: false, series: null })}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">{t('recurring.confirmTitle') || 'Confirm Cancellation'}</div>
                        <div className="modal-body">{confirmModal.message}</div>
                        <div className="modal-actions">
                            <button className="modal-btn secondary" onClick={() => setConfirmModal({ show: false, series: null })}>
                                {t('common.cancel') || 'Cancel'}
                            </button>
                            <button className="modal-btn primary" onClick={confirmCancel}>
                                {t('recurring.confirm') || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecurringTransactions;
