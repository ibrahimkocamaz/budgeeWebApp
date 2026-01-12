import React, { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import SpendingChart from './SpendingChart';
import Budgets from './Budgets';
import Transactions from './Transactions';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTransactions } from '../context/TransactionsContext';


const Dashboard = () => {
  const { t } = useLanguage();
  const { formatAmount } = useCurrency();
  const { transactions } = useTransactions();

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
  }, []);

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

          {/* Recent Transactions */}
          <section className="transactions-section">
            <div className="section-header">
              <h2>{t('dashboard.recentTransactions')}</h2>
              <Link to="/transactions" className="btn-link">{t('dashboard.viewAll')}</Link>
            </div>

            <div className="transactions-list-widget">
              <Transactions limit={5} showControls={false} />
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
              grid-template-columns: 1fr; /* Stack cards on smaller screens? Or resize? */
           }
           /* Perhaps 3 columns is too tight on 1024px split 2/3?
              2/3 of 1024 is ~680px. 680/3 = 226px per card. This is fine.
           */
        }
        
        @media (max-width: 1024px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
          
          .summary-cards-row {
             grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          }
        }

        /* Budgets Section */
        .budgets-section {
          /* background-color: var(--bg-card); */
          /* border-radius: 1rem; */
          /* border: 1px solid var(--color-divider); */
          /* padding: 1.5rem; */
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
          top: 24px; /* Sticky sidebar effect */
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

        /* Transactions Section */
        .transactions-section {
          background-color: var(--bg-card);
          border-radius: 1rem;
          border: 1px solid var(--color-divider);
          padding: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .btn-link {
          background: none;
          border: none;
          color: var(--color-brand);
          cursor: pointer;
          font-weight: 500;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

      `}</style>
    </div>
  );
};

export default Dashboard;
