import React, { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import SpendingChart from './SpendingChart';
import Budgets from './Budgets';
import Transactions from './Transactions';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCategories } from '../context/CategoriesContext';
import { useTransactions } from '../context/TransactionsContext';
import { useRecurringSeries } from '../hooks/useRecurringSeries';
import { getCategoryIcon, getCategoryColor as getDefaultCategoryColor } from '../data/categoryOptions';


const Dashboard = () => {
  const { categories } = useCategories();
  const { t } = useLanguage();
  const { formatAmount } = useCurrency();
  const { transactions } = useTransactions();
  const recurringSeries = useRecurringSeries();

  const upcomingRecurring = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 60);

    return recurringSeries.filter(series => {
      if (!series.nextDueDate || series.isCompleted) return false;
      const dueDate = new Date(series.nextDueDate);
      return dueDate >= now && dueDate <= thirtyDaysFromNow;
    }).slice(0, 4); // Limit to top 4
  }, [recurringSeries]);

  const getCategoryColor = (name) => {
    const cat = categories.find(c => c.name.toLowerCase() === (name || '').toLowerCase());
    return cat ? cat.color : getDefaultCategoryColor(name);
  };

  const summary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.reduce((acc, tx) => {
      const txDate = new Date(tx.date);
      const isCurrentMonth = txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
      const amount = Number(tx.amount);

      // Total Balance (All time)
      if (tx.type === 'income') {
        acc.totalBalance += amount;
      } else {
        acc.totalBalance -= amount;
      }

      // Monthly Stats
      if (isCurrentMonth) {
        if (tx.type === 'income') {
          acc.income += amount;
        } else {
          acc.expenses += amount;
        }
      }

      return acc;
    }, { totalBalance: 12500, income: 0, expenses: 0 });
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
              <div className="card-amount">{formatAmount(summary.totalBalance)}</div>
              <div className="card-footer">
                <span className="badge positive">+2.5%</span> <span className="text-muted">{t('common.vsLastMonth')}</span>
              </div>
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
                <h2>{t('dashboard.upcomingRecurring')}</h2>
                <Link to="/recurring" className="btn-link">{t('dashboard.viewAllRecurring') || 'View All'}</Link>
              </div>

              {upcomingRecurring.length > 0 ? (
                <div className="upcoming-list">
                  {upcomingRecurring.map(series => (
                    <div key={series.id} className="upcoming-item">
                      <div className="upcoming-icon" style={{ backgroundColor: getCategoryColor(series.category) }}>
                        {React.createElement(getCategoryIcon(series.category) || DollarSign, { size: 20 })}
                      </div>
                      <div className="upcoming-info">
                        <div className="upcoming-name">{series.description}</div>
                        <div className={`upcoming-date ${new Date(series.nextDueDate) - new Date() < 3 * 24 * 60 * 60 * 1000 ? 'urgent' : ''}`}>
                          {new Date(series.nextDueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div className={`upcoming-amount ${series.type}`}>
                        {series.type === 'income' ? '+' : ''}{formatAmount(series.amount)}
                      </div>
                    </div>
                  ))}
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
          gap: 2rem;
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
          gap: 1.5rem;
        }

        @media (max-width: 1200px) {
           .summary-cards-row {
              grid-template-columns: 1fr;
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
          gap: 1.5rem;
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
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .widget-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
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
            background-color: var(--bg-card);
            border-radius: 12px;
            border: 1px solid var(--color-divider);
            overflow: hidden;
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
            width: 40px;
            height: 40px;
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

        .upcoming-name {
            font-weight: 600;
            font-size: 0.95rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .upcoming-date {
            font-size: 0.8rem;
            color: var(--text-muted);
        }
        
        .upcoming-date.urgent {
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

        .icon-wrapper {
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

        .card-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .badge.positive {
          background-color: rgba(76, 175, 80, 0.1);
          color: var(--color-success);
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
