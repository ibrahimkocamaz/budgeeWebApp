
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, TrendingUp, TrendingDown, CircleDot, Repeat, CalendarRange, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCategories } from '../context/CategoriesContext';
import { useTransactions } from '../context/TransactionsContext';

const AddTransaction = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { getCategoriesByType } = useCategories();
  const { addTransaction } = useTransactions();

  // Memoize categories to avoid re-fetching on every render if possible, 
  // but context provided functions usually return array.
  const expenseCategories = getCategoriesByType('expense');
  const incomeCategories = getCategoriesByType('income');

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'expense',
      mode: 'single',
      date: new Date().toISOString().split('T')[0],
      category: '',
      title: '',
      amount: '',
      merchant: '',
      recurringCount: 1,
      recurringFrequency: 'monthly',
      recurringPricingMode: 'unit'
    }
  ]);
  const [activeModeRowId, setActiveModeRowId] = useState(null);

  const handleAddRow = () => {
    setTransactions([
      ...transactions,
      {
        id: Date.now(),
        type: 'expense',
        mode: 'single',
        date: new Date().toISOString().split('T')[0],
        category: '',
        title: '',
        amount: '',
        merchant: '',
        recurringCount: 1,
        recurringFrequency: 'monthly',
        recurringPricingMode: 'unit'
      }
    ]);
  };

  const handleRemoveRow = (id) => {
    if (transactions.length > 1) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleChange = (id, field, value) => {
    setTransactions(transactions.map(t => {
      if (t.id === id) {
        const updates = { [field]: value };
        // Reset category if type changes
        if (field === 'type') {
          updates.category = '';
        }
        return { ...t, ...updates };
      }
      return t;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Batch Transactions:", transactions);

    transactions.forEach(tx => {
      const baseDate = new Date(tx.date); // This treats YYYY-MM-DD as UTC, but since we just want to manipulate date parts, let's parse component-wise to be safe
      const [y, m, d] = tx.date.split('-').map(Number);
      // Create a local date object for the start
      // Note: month in Date is 0-indexed

      const count = tx.mode === 'recurring' ? parseInt(tx.recurringCount) || 1 : 1;
      const originalAmount = parseFloat(tx.amount) || 0;

      // Calculate amount per transaction
      let amountPerTx = originalAmount;
      if (tx.mode === 'recurring' && tx.recurringPricingMode === 'total') {
        amountPerTx = originalAmount / count;
      }

      const seriesId = tx.mode === 'recurring' ? `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null;

      for (let i = 0; i < count; i++) {
        // Calculate Date
        let txDate = new Date(y, m - 1, d);

        if (i > 0) {
          if (tx.recurringFrequency === 'weekly') {
            txDate.setDate(txDate.getDate() + (i * 7));
          } else if (tx.recurringFrequency === 'monthly') {
            txDate.setMonth(txDate.getMonth() + i);
          } else if (tx.recurringFrequency === 'yearly') {
            txDate.setFullYear(txDate.getFullYear() + i);
          }
        }

        addTransaction({
          ...tx,
          id: Date.now() + Math.random(),
          date: txDate.toISOString(),
          paymentType: tx.mode,
          amount: amountPerTx.toString(),
          description: tx.title,
          // Add metadata for recurring
          recurring: tx.mode === 'recurring' ? 1 : 0,
          recurringSeriesId: seriesId,
          recurringTransactionCount: i + 1,
          totalRecurringTransactions: count
        });
      }
    });

    navigate('/');
  };

  const xf_amount_clean = (amt) => {
    // Basic cleanup if needed, though input is number
    return parseFloat(amt).toString();
  };

  const getTotalAmount = () => {
    return transactions.reduce((acc, curr) => {
      const val = parseFloat(curr.amount) || 0;
      return curr.type === 'income' ? acc + val : acc - val;
    }, 0);
  };

  return (
    <div className="add-transaction-container">
      <div className="header">
        <Link to="/" className="back-btn">
          <ArrowLeft size={24} />
        </Link>
        <h2>{t('addTransaction.title')}</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <form onSubmit={handleSubmit} className="batch-form">
        <div className="transactions-list">
          {transactions.map((tx, index) => (
            <div key={tx.id} className="transaction-row card">
              <div className="row-header">
                <span className="row-number">#{index + 1}</span>
                <div className="row-header-actions">
                  <div className="mode-tabs-small">
                    {activeModeRowId === tx.id ? (
                      <>
                        <button
                          type="button"
                          className={`mode-btn-small ${tx.mode === 'single' ? 'active' : ''}`}
                          onClick={() => { handleChange(tx.id, 'mode', 'single'); setActiveModeRowId(null); }}
                        >
                          {t('addTransaction.single') || 'Single'}
                        </button>
                        <button
                          type="button"
                          className={`mode-btn-small ${tx.mode === 'recurring' ? 'active' : ''}`}
                          onClick={() => { handleChange(tx.id, 'mode', 'recurring'); setActiveModeRowId(null); }}
                        >
                          {t('addTransaction.recurring') || 'Recurring'}
                        </button>

                      </>
                    ) : (
                      <button
                        type="button"
                        className="mode-btn-small active dropdown-trigger"
                        onClick={() => setActiveModeRowId(tx.id)}
                      >
                        <ChevronLeft size={14} style={{ marginRight: 4, opacity: 0.7 }} />
                        {t(`addTransaction.${tx.mode}`) || tx.mode}
                      </button>
                    )}
                  </div>

                  {tx.mode === 'recurring' && (
                    <div className="recurring-inline-controls">
                      <div className="inline-field">
                        <label>{t('addTransaction.count')}</label>
                        <input
                          type="number"
                          min="2"
                          value={tx.recurringCount}
                          onChange={(e) => handleChange(tx.id, 'recurringCount', e.target.value)}
                          className="tiny-input"
                        />
                      </div>
                      <div className="inline-field">
                        <label>{t('addTransaction.frequency')}</label>
                        <select
                          value={tx.recurringFrequency}
                          onChange={(e) => handleChange(tx.id, 'recurringFrequency', e.target.value)}
                          className="tiny-select"
                        >
                          <option value="weekly">{t('addTransaction.weekly')}</option>
                          <option value="monthly">{t('addTransaction.monthly')}</option>
                          <option value="yearly">{t('addTransaction.yearly')}</option>
                        </select>
                      </div>
                      <div className="inline-field pricing-field">
                        {tx.recurringPricingMode === 'total' && tx.amount && tx.recurringCount > 0 && (
                          <span className="split-helper-text">
                            {(parseFloat(tx.amount) / parseInt(tx.recurringCount)).toFixed(2)} {t(`addTransaction.per${tx.recurringFrequency.replace('ly', '').charAt(0).toUpperCase() + tx.recurringFrequency.replace('ly', '').slice(1)}`)}
                          </span>
                        )}
                        <div className="toggle-pill tiny">
                          <button
                            type="button"
                            className={`pill-btn ${tx.recurringPricingMode === 'unit' ? 'active' : ''}`}
                            onClick={() => handleChange(tx.id, 'recurringPricingMode', 'unit')}
                            title={t('addTransaction.unit')}
                          >
                            {t('addTransaction.unit')}
                          </button>
                          <button
                            type="button"
                            className={`pill-btn ${tx.recurringPricingMode === 'total' ? 'active' : ''}`}
                            onClick={() => handleChange(tx.id, 'recurringPricingMode', 'total')}
                            title={t('addTransaction.total')}
                          >
                            {t('addTransaction.total')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {transactions.length > 1 && (
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleRemoveRow(tx.id)}
                      title="Remove row"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="row-grid">
                {/* Type Toggle */}
                <div className="field-group type-select">
                  <div className="toggle-pill">
                    <button
                      type="button"
                      className={`pill-btn ${tx.type === 'expense' ? 'active expense' : ''}`}
                      onClick={() => handleChange(tx.id, 'type', 'expense')}
                      title={t('addTransaction.expense')}
                    >
                      <TrendingDown size={16} />
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${tx.type === 'income' ? 'active income' : ''}`}
                      onClick={() => handleChange(tx.id, 'type', 'income')}
                      title={t('addTransaction.income')}
                    >
                      <TrendingUp size={16} />
                    </button>
                  </div>
                </div>

                {/* Date */}
                <div className="field-group date-input">
                  <input
                    type="date"
                    value={tx.date}
                    onChange={(e) => handleChange(tx.id, 'date', e.target.value)}
                    required
                  />
                </div>

                {/* Category */}
                <div className="field-group">
                  <select
                    value={tx.category}
                    onChange={(e) => handleChange(tx.id, 'category', e.target.value)}
                    required
                    className={!tx.category ? 'placeholder' : ''}
                  >
                    <option value="" disabled>{t('addTransaction.selectCategory')}</option>
                    {(tx.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                      <option key={cat.id} value={cat.name.toLowerCase()}>
                        {t(`categoryNames.${cat.name.toLowerCase()}`) || cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div className="field-group flex-2">
                  <input
                    type="text"
                    placeholder={t('addTransaction.titlePlaceholder')}
                    value={tx.title}
                    onChange={(e) => handleChange(tx.id, 'title', e.target.value)}
                    required
                  />
                </div>

                {/* Amount */}
                <div className="field-group amount-input">
                  <span className="scurrency">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={tx.amount}
                    onChange={(e) => handleChange(tx.id, 'amount', e.target.value)}
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary add-row-btn" onClick={handleAddRow}>
            <Plus size={20} />
            Add Another
          </button>
        </div>

        <div className="footer-summary">
          <div className="total-preview">
            <span>Net Change:</span>
            <span className={getTotalAmount() >= 0 ? 'pos' : 'neg'}>
              {getTotalAmount() >= 0 ? '+' : ''}{getTotalAmount().toFixed(2)}
            </span>
          </div>
          <button type="submit" className="submit-btn-large">
            <Save size={20} />
            {t('addTransaction.save')} {transactions.length} Item{transactions.length !== 1 ? 's' : ''}
          </button>
        </div>
      </form>

      <style>{`
                .add-transaction-container {
                    max-width: 100%;
                    margin: 0 auto;
                    padding-bottom: 100px;
                }

                .header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                }

                .header h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                .back-btn {
                    color: var(--text-main);
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: background-color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .back-btn:hover {
                    background-color: rgba(255,255,255,0.1);
                }

                /* Batch Form Styles */
                .transactions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    background-color: var(--bg-card);
                    border: 1px solid var(--color-divider);
                    border-radius: 12px;
                    overflow: hidden; /* Clip corners */
                }

                .transaction-row {
                    background-color: transparent;
                    border: none;
                    border-bottom: 1px solid var(--color-divider);
                    border-radius: 0;
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    transition: background-color 0.2s;
                }
                
                .transaction-row:last-child {
                    border-bottom: none;
                }
                
                /* Remove the hover border effect since we don't have borders anymore */
                .transaction-row:hover {
                    background-color: rgba(255, 255, 255, 0.02);
                }

                .row-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                }

                .row-number {
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .delete-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                }
                
                .delete-btn:hover {
                    color: var(--color-accent-red);
                    background-color: rgba(220, 38, 38, 0.1);
                }

                .row-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .mode-tabs-small {
                    display: flex;
                    gap: 4px;
                    background-color: var(--bg-app);
                    padding: 2px;
                    border-radius: 6px;
                    border: 1px solid var(--color-input-border);
                }

                .mode-btn-small {
                    border: none;
                    background: none;
                    padding: 4px 10px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: var(--text-muted);
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .mode-btn-small:hover {
                    color: var(--text-main);
                }

                .mode-btn-small.active {
                    background-color: var(--color-brand);
                    color: white;
                    font-weight: 600;
                }

                .mode-btn-small.dropdown-trigger {
                    display: flex;
                    align-items: center;
                    padding-left: 6px; /* Adjusted padding for left icon */
                    padding-right: 10px;
                }

                /* Mobile Adjustment for Header */
                @media (max-width: 600px) {
                    .row-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                    .row-header-actions {
                        width: 100%;
                        justify-content: space-between;
                    }
                }

                .row-grid {
                    display: grid;
                    grid-template-columns: 100px 135px 160px 1fr 120px; /* Removed mode column */
                    gap: 0.75rem;
                    align-items: center;
                }

                .field-group {
                    display: flex;
                    flex-direction: column;
                }
                
                .field-group.flex-2 {
                    flex: 1; /* Title takes remaining space */
                }

                .field-group input, .field-group select {
                    background-color: var(--bg-app);
                    border: 1px solid var(--color-input-border);
                    padding: 0.6rem;
                    border-radius: 8px;
                    color: var(--text-main);
                    font-size: 0.9rem;
                    width: 100%;
                    outline: none;
                }

                .field-group input:focus, .field-group select:focus {
                    border-color: var(--color-brand);
                }

                /* Type Toggle Pill */
                .toggle-pill {
                    display: flex;
                    background-color: var(--bg-app);
                    border-radius: 8px;
                    padding: 2px;
                    border: 1px solid var(--color-input-border);
                }

                .pill-btn {
                    flex: 1;
                    border: none;
                    background: none;
                    padding: 6px; /* Increased padding slightly for hit area since icon is small */
                    font-size: 0.8rem;
                    font-weight: 600;
                    border-radius: 6px;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .pill-btn.active {
                    background-color: var(--color-brand);
                    color: white;
                }

                .pill-btn.active.expense {
                    background-color: var(--color-accent-red);
                    color: white;
                }
                
                .pill-btn.active.income {
                    background-color: var(--color-brand);
                    color: white;
                }

                /* Amount Input */
                .amount-input {
                    position: relative;
                }
                
                .amount-input input {
                    padding-left: 1.2rem;
                    font-weight: 600;
                }

                .scurrency {
                    position: absolute;
                    left: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                /* Actions */
                .form-actions {
                    margin-top: 1.5rem;
                    margin-bottom: 3rem; /* Added spacing from footer */
                    display: flex;
                    justify-content: center;
                }

                .add-row-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0.75rem 1.5rem;
                    background-color: transparent;
                    border: 1px dashed var(--color-divider);
                    color: var(--text-muted);
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                    width: 100%;
                    justify-content: center;
                }

                .add-row-btn:hover {
                    border-color: var(--color-brand);
                    color: var(--color-brand);
                    background-color: rgba(0, 200, 83, 0.05); /* Brand tint */
                    border-style: solid;
                }

                /* Footer */
                .footer-summary {
                    position: sticky;
                    bottom: 1.5rem;
                    background-color: var(--bg-card);
                    padding: 1rem 1.5rem;
                    border: 1px solid var(--color-divider);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    z-index: 50;
                }
                


                .total-preview {
                    display: flex;
                    flex-direction: column;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .total-preview span:last-child {
                    font-size: 1.2rem;
                    font-weight: 700;
                }
                
                .pos { color: var(--color-success); }
                .neg { color: var(--text-main); }

                .submit-btn-large {
                    background-color: var(--color-brand);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }

                .submit-btn-large:hover {
                    background-color: var(--color-brand-hover);
                }

                /* Mobile Responsive */
                @media (max-width: 900px) {
                    .row-grid {
                        grid-template-columns: 1fr 1fr;
                        grid-template-areas: 
                            "type date"
                            "cat cat" /* Category now spans two columns */
                            "title title"
                            "amt amt";
                        gap: 0.75rem;
                    }
                    
                    .type-select { grid-area: type; }
                    .date-input { grid-area: date; }
                    /* Mode selector is now outside row-grid */
                    .field-group:nth-child(3) { grid-area: cat; } /* Category is now the 3rd child in row-grid */
                    .field-group.flex-2 { grid-area: title; }
                    .amount-input { grid-area: amt; }
                    
                    .add-transaction-container {
                        padding-bottom: 80px;
                    }
                }

                /* Recurring Inline Options */
                .recurring-inline-controls {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-left: 12px;
                    padding-left: 12px;
                    border-left: 1px solid var(--color-divider);
                }

                .inline-field {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .inline-field label {
                    white-space: nowrap;
                    font-weight: 500;
                }

                .tiny-input {
                    background-color: var(--bg-app);
                    border: 1px solid var(--color-input-border);
                    border-radius: 6px;
                    padding: 4px 8px;
                    color: var(--text-main);
                    font-size: 0.8rem;
                    width: 60px; /* Fixed small width for count */
                    outline: none;
                }

                .tiny-select {
                    background-color: var(--bg-app);
                    border: 1px solid var(--color-input-border);
                    border-radius: 6px;
                    padding: 4px 8px;
                    color: var(--text-main);
                    font-size: 0.8rem;
                    width: auto;
                    min-width: 80px;
                    outline: none;
                }

                .tiny-input:focus, .tiny-select:focus {
                    border-color: var(--color-brand);
                }

                .inline-field.pricing-field {
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: center;
                    gap: 2px;
                    position: relative; /* Anchor for absolute text */
                }

                .split-helper-text {
                    position: absolute;
                    top: -16px; /* Position above the buttons */
                    left: 2px;
                    font-size: 0.65rem;
                    color: var(--color-brand);
                    font-weight: 600;
                    white-space: nowrap;
                    pointer-events: none;
                }

                .toggle-pill.tiny {
                     padding: 1px;
                     display: flex; /* Ensure flex layout */
                }

                .toggle-pill.tiny .pill-btn {
                    font-size: 0.75rem;
                    padding: 4px 12px; /* More horizontal padding */
                    white-space: nowrap; /* Prevent wrapping */
                }

                /* Mobile wrap for header actions if too wide */
                @media (max-width: 900px) {
                  .row-header {
                      flex-wrap: wrap; 
                  }
                  .row-header-actions {
                      width: 100%;
                      flex-wrap: wrap;
                      gap: 8px;
                      margin-top: 8px;
                  }
                  .recurring-inline-controls {
                      margin-left: 0;
                      padding-left: 0;
                      border-left: none;
                      width: 100%;
                      overflow-x: auto; /* Scroll if needed on very small screens */
                      padding-bottom: 4px;
                  }
                }
            `}</style>

    </div >
  );
};

export default AddTransaction;
