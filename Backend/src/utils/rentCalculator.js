const { AGREEMENT_CYCLE_MONTHS } = require('../config/constants');

const calculateEscalatedRent = (baseRent, escalationPercent, cycleNumber) => {
  if (!escalationPercent || cycleNumber <= 1) return parseFloat(baseRent);
  const multiplier = Math.pow(1 + escalationPercent / 100, cycleNumber - 1);
  return parseFloat((baseRent * multiplier).toFixed(2));
};

const buildRentCycles = (startDate, durationMonths, baseRent, escalationPercent) => {
  const cycles = [];
  const totalCycles = Math.ceil(durationMonths / AGREEMENT_CYCLE_MONTHS);

  for (let i = 0; i < totalCycles; i++) {
    const cycleStart = new Date(startDate);
    cycleStart.setMonth(cycleStart.getMonth() + i * AGREEMENT_CYCLE_MONTHS);

    const cycleEnd = new Date(cycleStart);
    const remainingMonths = Math.min(
      AGREEMENT_CYCLE_MONTHS,
      durationMonths - i * AGREEMENT_CYCLE_MONTHS
    );
    cycleEnd.setMonth(cycleEnd.getMonth() + remainingMonths);
    cycleEnd.setDate(cycleEnd.getDate() - 1);

    const monthlyRent = calculateEscalatedRent(baseRent, escalationPercent, i + 1);

    cycles.push({
      cycleNumber: i + 1,
      startDate: cycleStart,
      endDate: cycleEnd,
      monthlyRent,
    });
  }

  return cycles;
};

module.exports = { calculateEscalatedRent, buildRentCycles };