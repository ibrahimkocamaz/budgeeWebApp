import { useMemo } from 'react';
import { useTransactions } from '../context/TransactionsContext';

export const useRecurringSeries = () => {
    const { transactions } = useTransactions();

    const recurringSeries = useMemo(() => {
        // Filter for recurring transactions
        const recurring = transactions.filter(tx => tx.recurring === 1);

        const groups = {};

        recurring.forEach(tx => {
            // Robust grouping: Use seriesId if present, otherwise fallback to Description + Type + Frequency
            // We EXCLUDE amount from the key so that price changes don't split the group
            let key;
            if (tx.recurringSeriesId) {
                key = tx.recurringSeriesId;
            } else {
                key = `${tx.description}-${tx.type}-${tx.recurringFrequency || 'monthly'}`;
            }

            if (!groups[key]) {
                groups[key] = {
                    id: key,
                    description: tx.description,
                    type: tx.type,
                    category: tx.category,
                    frequency: tx.recurringFrequency,
                    transactions: []
                };
            }
            groups[key].transactions.push(tx);
        });

        // Process groups
        return Object.values(groups).map(group => {
            // Sort transactions by date
            const sorted = group.transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

            const now = new Date();
            // Count paid/passed transactions
            const paidCount = sorted.filter(tx => new Date(tx.date) <= now).length;

            // Total count is derived from actual array length (fixes progress when items are deleted/cancelled)
            const totalCount = sorted.length;

            // Next due transaction (for Next Due Date AND Current Amount)
            const nextDue = sorted.find(tx => new Date(tx.date) > now);
            const nextDueDate = nextDue ? new Date(nextDue.date) : null;

            // Current amount is based on the *next* transaction (future price) or the last one if all paid
            const currentAmount = nextDue ? nextDue.amount : (sorted[sorted.length - 1]?.amount || 0);

            const isCompleted = paidCount >= totalCount;

            // Remaining amount = sum of amounts of all future transactions
            const futureTxs = sorted.filter(tx => new Date(tx.date) > now);
            const remainingAmount = futureTxs.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

            return {
                ...group,
                amount: currentAmount, // Dynamic amount
                paidCount,
                totalCount,
                nextDueDate,
                isCompleted,
                remainingAmount,
                startDate: sorted[0]?.date,
                endDate: sorted[sorted.length - 1]?.date
            };
        }).sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
            if (!a.nextDueDate && !b.nextDueDate) return 0;
            if (!a.nextDueDate) return 1;
            if (!b.nextDueDate) return -1;
            return a.nextDueDate - b.nextDueDate;
        });
    }, [transactions]);

    return recurringSeries;
};
