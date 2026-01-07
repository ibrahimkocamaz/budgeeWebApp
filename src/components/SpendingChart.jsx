import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { mockSpendingByCategory } from '../data/mockData';
import { useCurrency } from '../context/CurrencyContext';

const SpendingChart = () => {
    const { formatAmount } = useCurrency();
    const total = mockSpendingByCategory.reduce((acc, item) => acc + item.value, 0);

    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <ul className="custom-legend-list">
                {payload.map((entry, index) => {
                    const { color, value, payload: data } = entry;
                    const percent = ((data.value / total) * 100).toFixed(0);

                    return (
                        <li key={`item-${index}`} className="legend-item">
                            <div className="legend-info">
                                <span className="legend-color" style={{ backgroundColor: color }}></span>
                                <span className="legend-name">{value}</span>
                            </div>
                            <div className="legend-values">
                                <span className="legend-percent">{percent}%</span>
                                <span className="legend-amount">{formatAmount(data.value)}</span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
                <PieChart margin={{ bottom: 0 }}>
                    <Pie
                        data={mockSpendingByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {mockSpendingByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1A1F26', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="bottom"
                        align="center"
                        content={renderLegend}
                    />
                </PieChart>
            </ResponsiveContainer>

            <style>{`
        .chart-container {
          flex: 1;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-legend-list {
            list-style: none;
            padding: 0;
            margin-top: 20px;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .legend-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.875rem;
            color: var(--text-muted);
        }

        .legend-info {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .legend-color {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }

        .legend-name {
            color: var(--text-main);
            font-weight: 500;
        }

        .legend-values {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .legend-percent {
            font-weight: 600;
            color: var(--text-main);
            background-color: rgba(255,255,255,0.05);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.75rem;
        }
      `}</style>
        </div>
    );
};

export default SpendingChart;
