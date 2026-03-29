const dateHelper = {
  formatDate: (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split('T')[0];
  },

  getLedgerMonth: (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  },

  addMonths: (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  },

  diffInDays: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  },

  isBefore: (date1, date2) => new Date(date1) < new Date(date2),

  isToday: (date) => {
    const d = new Date(date);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  },

  getDueDateForMonth: (dueDay, year, month) => {
    const lastDay = new Date(year, month, 0).getDate();
    const day = Math.min(dueDay, lastDay);
    return new Date(year, month - 1, day);
  },
};

module.exports = dateHelper;