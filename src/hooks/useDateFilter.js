import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';

export const useDateFilter = () => {
    const { settings } = useSettings();
    const { language } = useLanguage();
    const startDay = settings.monthStartDay || 1;

    // Get the logical "Month Range" that a given date falls into.
    // If startDay is 1, it's just the calendar month.
    // If startDay is 18, and we pass Jan 20, it belongs to the Jan 18 - Feb 17 cycle.
    // If startDay is 18, and we pass Jan 10, it belongs to the Dec 18 - Jan 17 cycle.
    const getMonthRange = (dateInput) => {
        const date = new Date(dateInput);
        let year = date.getFullYear();
        let month = date.getMonth();

        // If start day is 1, simpler logic
        if (startDay === 1) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
            return {
                startDate,
                endDate,
                label: startDate.toLocaleDateString(language, { month: 'long', year: 'numeric' })
            };
        }

        // Custom start day logic
        let startDate, endDate;

        if (date.getDate() >= startDay) {
            // We are in the cycle starting this month
            // e.g. Jan 20 (start 18) -> Jan 18 to Feb 17
            startDate = new Date(year, month, startDay);
            // End date is next month, startDay - 1
            endDate = new Date(year, month + 1, startDay - 1, 23, 59, 59, 999);
        } else {
            // We are in the cycle that started last month
            // e.g. Jan 10 (start 18) -> Dec 18 to Jan 17
            startDate = new Date(year, month - 1, startDay);
            endDate = new Date(year, month, startDay - 1, 23, 59, 59, 999);
        }

        // Format label, e.g. "Dec 18 - Jan 17" or maybe just the primary month name?
        // Let's stick to a range string for clarity if custom, otherwise month name.
        const startStr = startDate.toLocaleDateString(language, { month: 'short', day: 'numeric' });
        const endStr = endDate.toLocaleDateString(language, { month: 'short', day: 'numeric' });

        return {
            startDate,
            endDate,
            label: `${startStr} - ${endStr}`
        };
    };

    const isInCurrentMonth = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const { startDate, endDate } = getMonthRange(now);
        return date >= startDate && date <= endDate;
    };

    return { getMonthRange, isInCurrentMonth };
};
