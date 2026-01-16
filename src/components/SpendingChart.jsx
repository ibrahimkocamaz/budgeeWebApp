import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTransactions } from '../context/TransactionsContext';
import { getCategoryColor, getCategoryIcon } from '../data/categoryOptions';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { useCategories } from '../context/CategoriesContext';

const SpendingChart = () => {
    const { formatAmount } = useCurrency();
    const { t, tCategory } = useLanguage();
    const { categories } = useCategories();
    const { transactions } = useTransactions();

    const spendingData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const expenses = transactions.filter(t => {
            if (t.type !== 'expense') return false;

            // Safer comparison using string splitting to avoid timezone shifts
            if (typeof t.date === 'string') {
                const [year, month] = t.date.split('-');
                // month is 01-12, currentMonth is 0-11
                return (parseInt(month) - 1) === currentMonth && parseInt(year) === currentYear;
            }

            // Fallback if it's already a Date object
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        // Fast lookup map for category details
        const catLookup = categories.reduce((acc, c) => {
            acc[c.name.toLowerCase()] = c;
            return acc;
        }, {});

        const categoryMap = {};

        expenses.forEach(tx => {
            const cat = tx.category.toLowerCase();
            if (!categoryMap[cat]) {
                categoryMap[cat] = 0;
            }
            categoryMap[cat] += Number(tx.amount);
        });

        return Object.entries(categoryMap)
            .map(([name, value]) => {
                const categoryObj = catLookup[name.toLowerCase()];
                return {
                    name: tCategory(name),
                    value,
                    color: categoryObj ? categoryObj.color : getCategoryColor(name),
                    icon: categoryObj ? getCategoryIcon(categoryObj.icon_key) : getCategoryIcon(name)
                };
            })
            .sort((a, b) => b.value - a.value);
    }, [transactions, categories, t]);

    const total = spendingData.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="chart-container">
            {/* Chart Area - Fixed Height for the Donut */}
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ bottom: 0 }}>
                        <Pie
                            data={spendingData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {spendingData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1A1F26', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => formatAmount(value)}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend Area - Dynamic Height */}
            <ul className="custom-legend-list">
                {spendingData.map((entry, index) => {
                    const { color, value, icon: Icon } = entry;
                    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

                    return (
                        <li key={`item-${index}`} className="legend-item">
                            <div className="legend-info">
                                <div className="legend-icon-wrapper" style={{ backgroundColor: color }}>
                                    <Icon size={16} color="#FFF" />
                                </div>
                                <div className="legend-text">
                                    <span className="legend-name">{entry.name}</span>
                                    <span className="legend-percent-sub">{percent}%</span>
                                </div>
                            </div>
                            <div className="legend-amount">{formatAmount(value)}</div>
                        </li>
                    );
                })}
            </ul>

            <style>{`
        .chart-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          /* No fixed height, let content grow */
        }

        .custom-legend-list {
            list-style: none;
            padding: 0;
            margin-top: 16px;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .legend-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .legend-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .legend-icon-wrapper {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .legend-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .legend-name {
            color: var(--text-main);
            font-weight: 600;
            font-size: 0.9rem;
            line-height: 1.2;
        }

        .legend-percent-sub {
            color: var(--text-muted);
            font-size: 0.75rem;
        }

        .legend-amount {
            font-weight: 700;
            color: var(--text-main);
            font-size: 1rem;
        }
      `}</style>
        </div>
    );
};

export default SpendingChart;
