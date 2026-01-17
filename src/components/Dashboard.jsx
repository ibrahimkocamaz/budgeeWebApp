import React, { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import SpendingChart from './SpendingChart';
import Budgets from './Budgets';
import Transactions from './Transactions';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCategories } from '../context/CategoriesContext';
import { useAccounts } from '../context/AccountsContext';
import { useTransactions } from '../context/TransactionsContext';
import { useRecurringSeries } from '../hooks/useRecurringSeries';
import { getCategoryIcon, getCategoryColor as getDefaultCategoryColor } from '../data/categoryOptions';


const Dashboard = () => {
  const { categories } = useCategories();
  const { t, tCategory } = useLanguage();
  const { formatAmount } = useCurrency();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts(); // Get accounts
  const recurringSeries = useRecurringSeries();

  // Calculate Total Balance from Accounts
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);
  }, [accounts]);

  const { upcomingItems, upcomingTotal, totalCount } = useMemo(() => {
    // ... existing upcoming logic
    const today = new Date();
    const sixtyDaysFromNow = new Date(today);
    sixtyDaysFromNow.setDate(today.getDate() + 60);

    const all = recurringSeries.filter(series => {
      if (!series.nextDueDate) return false;
      const dueDate = new Date(series.nextDueDate);
      return series.active !== false &&
        series.type === 'expense' &&
        dueDate >= today &&
        dueDate <= sixtyDaysFromNow;
    }).sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));

    const total = all.reduce((sum, item) => sum + Number(item.amount), 0);
    return { upcomingItems: all.slice(0, 5), upcomingTotal: total, totalCount: all.length };
  }, [recurringSeries]);

  const getCategoryColor = (name) => {
    const cat = categories.find(c => c.name.toLowerCase() === (name || '').toLowerCase());
    return cat ? cat.color : getDefaultCategoryColor(name);
  };

  const getCategoryIconByName = (name) => {
    const cat = categories.find(c => c.name.toLowerCase() === (name || '').toLowerCase());
    return getCategoryIcon(cat ? cat.icon_key : name);
  };

  const summary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate last month date correctly handling January
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const stats = transactions.reduce((acc, tx) => {
      const txDate = new Date(tx.date);
      const amount = Number(tx.amount);

      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        if (tx.type === 'income') acc.income += amount;
        else acc.expenses += amount;
      }

      return acc;
    }, { income: 0, expenses: 0 });

    return stats;
  }, [transactions]);



  return (
    <div className="dashboard-container">

      <div className="dashboard-content">
        {/* LEFT COLUMN (2/3) */}
        <div className="left-column">

          {/* Summary Cards Row */}
          <section className="summary-cards-row">
            <div className="card balance-card">
              <div className="card-header">
                <h3>{t('dashboard.totalBalance')}</h3>
                <div className="icon-wrapper">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="card-amount">{formatAmount(totalBalance)}</div>
            </div>

            <div className="card income-card">
              <div className="card-header">
                <h3>{t('dashboard.income')}</h3>
                <div className="icon-wrapper success">
                  <ArrowUpRight size={20} />
                </div>
              </div>
              <div className="card-amount success-text">{formatAmount(summary.income)}</div>
            </div>

            <div className="card expense-card">
              <div className="card-header">
                <h3>{t('dashboard.expenses')}</h3>
                <div className="icon-wrapper error">
                  <ArrowDownRight size={20} />
                </div>
              </div>
              <div className="card-amount error-text">{formatAmount(summary.expenses)}</div>
            </div>
          </section>

          {/* Transactions Split Section */}
          <section className="transactions-split-section">
            {/* Recent Transactions Widget */}
            <div className="transactions-widget">
              <div className="widget-header">
                <h2>{t('dashboard.recentTransactions')}</h2>
                <Link to="/transactions" className="btn-link">{t('dashboard.viewAll')}</Link>
              </div>
              <div className="transactions-list-widget">
                <Transactions limit={5} showControls={false} />
              </div>
            </div>

            {/* Upcoming Recurring Widget */}
            <div className="recurring-widget">
              <div className="widget-header">
                <div className="header-title-group">
                  <h2>{t('dashboard.upcomingRecurring')}</h2>
                  <span className="header-total">({formatAmount(upcomingTotal)})</span>
                </div>
                <Link to="/recurring" className="btn-link">{t('dashboard.viewAll')}</Link>
              </div>

              {upcomingItems.length > 0 ? (
                <div className="upcoming-list">
                  {upcomingItems.map(series => (
                    <div key={series.id} className="upcoming-item">
                      <div className="upcoming-icon" style={{ backgroundColor: getCategoryColor(series.category) }}>
                        {React.createElement(getCategoryIconByName(series.category) || DollarSign, { size: 24, color: "white" })}
                      </div>
                      <div className="upcoming-info">
                        <div className="upcoming-main">{tCategory(series.category)}</div>
                        <div className="upcoming-sub">{series.description}</div>
                      </div>
                      <div className="upcoming-amount-wrapper">
                        <div className={`upcoming-amount ${series.type}`}>
                          {series.type === 'income' ? '+' : ''}{formatAmount(series.amount)}
                        </div>
                        <div className={`upcoming-date-sub ${new Date(series.nextDueDate) - new Date() < 3 * 24 * 60 * 60 * 1000 ? 'urgent' : ''}`}>
                          {new Date(series.nextDueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {totalCount > upcomingItems.length && (
                    <div className="upcoming-more">
                      <Link to="/recurring" className="more-link">
                        {t('dashboard.andMore', { count: totalCount - upcomingItems.length }) || `+ ${totalCount - upcomingItems.length} more`}
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-recurring">
                  {t('dashboard.noUpcomingRecurring') || 'No upcoming payments'}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="right-column">
          {/* Budgets Widget */}
          <section className="budgets-section">

            <Budgets limit={3} simpleMode={true} />
          </section>

          {/* Charts Section */}
          <section className="charts-section">
            <div className="section-header">
              <h2>{t('dashboard.spendingByCategory')}</h2>
            </div>
            <SpendingChart />
          </section>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          max-width: 100%;
          margin: 0 auto;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .left-column,
        .right-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Summary Cards Row */
        .summary-cards-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        @media (max-width: 1200px) {
           .summary-cards-row {
              grid-template-columns: 1fr;
           }
        }
        
        @media (max-width: 768px) {

           .summary-cards-row {
              display: flex;
              flex-wrap: wrap;
           }
           
           .balance-card { 
               width: 100%;
               order: 3;
           }
           
           .income-card, .expense-card {
               flex: 1;
               min-width: 0; /* crucial for flexbox */
           }
           
           .income-card { order: 1; }
           .expense-card { order: 2; }

           /* Ultra Compact Mobile Cards */
           .summary-cards-row .card {
               padding: 12px;
               gap: 8px;
               min-height: 80px; /* Enforce shortness */
               justify-content: center;
           }

           .summary-cards-row .card-header h3 {
               font-size: 0.75rem;
               margin: 0;
           }

           .summary-cards-row .card-amount {
               font-size: 1.2rem;
               line-height: 1.2;
           }

           .summary-cards-row .icon-wrapper {
               width: 28px;
               height: 28px;
           }
           
           .summary-cards-row .icon-wrapper svg {
               width: 16px;
               height: 16px;
           }
        }
        
        @media (max-width: 1024px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
          
          .summary-cards-row {
             grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          }
        }

        /* Transactions Split Section */
        .transactions-split-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .transactions-split-section {
            grid-template-columns: 1fr;
          }
        }

        .transactions-widget, .recurring-widget {
          background-color: var(--bg-card);
          border-radius: 1rem;
          border: 1px solid var(--color-divider);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .widget-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            padding-bottom: 0.5rem;
        }

        .widget-header h2 {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-main);
        }

        .btn-link {
          background: none;
          border: none;
          color: var(--color-brand);
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
          font-size: 0.9rem;
        }

        /* Upcoming List - Grouped Style */
        .upcoming-list {
            display: flex;
            flex-direction: column;
            /* Removed card styles from inner list */
        }
        
        .upcoming-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-bottom: 1px solid var(--color-divider);
            background-color: transparent;
            transition: background-color 0.2s;
        }

        .upcoming-item:last-child {
            border-bottom: none;
        }
        
        .upcoming-item:hover {
            background-color: rgba(0,0,0,0.04);
        }

        .upcoming-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            flex-shrink: 0;
        }

        .upcoming-info {
            flex: 1;
            overflow: hidden;
        }

        .upcoming-main {
            font-weight: 600;
            font-size: 0.95rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .upcoming-sub {
            font-size: 0.85rem;
            color: var(--text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .upcoming-amount-wrapper {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            margin-left: 1rem;
        }

        .upcoming-date-sub {
            font-size: 0.75rem;
            color: var(--text-muted);
            margin-top: 2px;
        }
        
        .upcoming-date-sub.urgent {
            color: var(--color-cancel);
            font-weight: 600;
        }

        .upcoming-amount {
            font-weight: 700;
            font-size: 1rem;
        }

        .upcoming-amount.income {
            color: var(--color-success);
        }

        .empty-recurring {
            text-align: center;
            color: var(--text-muted);
            padding: 2rem 0;
            font-size: 0.9rem;
        }

        /* Budgets Section */
        .budgets-section {
          display: flex;
          flex-direction: column;
        }

        /* Charts Section */
        .charts-section {
          background-color: var(--bg-card);
          border-radius: 1rem;
          border: 1px solid var(--color-divider);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 24px; 
        }

        .card {
          background-color: var(--bg-card);
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid var(--color-divider);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .header-title-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .header-total {
            font-size: 1rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header h3 {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .summary-cards-row .icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
        }
        
        .icon-wrapper.success {
          background-color: rgba(76, 175, 80, 0.1);
          color: var(--color-success);
        }

        .icon-wrapper.error {
          background-color: rgba(244, 67, 54, 0.1);
          color: var(--color-cancel);
        }

        .card-amount {
          font-size: 2rem;
          font-weight: 700;
        }
        
        .success-text { color: var(--text-income); }
        .error-text { color: var(--text-expense); }

        .upcoming-more {
            padding: 12px;
            text-align: center;
            border-top: 1px solid var(--color-divider);
            background-color: rgba(0,0,0,0.02);
        }

        .more-link {
            font-size: 0.85rem;
            color: var(--color-brand);
            text-decoration: none;
            font-weight: 500;
        }

        .more-link:hover {
            text-decoration: underline;
        }

        .badge.positive {
          background-color: rgba(76, 175, 80, 0.1);
          color: var(--color-success);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .badge.negative {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--color-cancel);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

      `}</style>
    </div>
  );
};

export default Dashboard;
