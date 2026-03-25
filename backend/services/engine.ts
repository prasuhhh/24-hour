import { obligations, receivables, loans, dashboardState } from '../data/mockData';

export const recalculateD2Z = (
  bal: number = 80000,
  muraliEarly: number = 0,
  karimDelay: number = 0,
  loanDraw: number = 0,
  buf: number = 10000
) => {
  let cash = bal + loanDraw;
  // Events matching the mock front-end
  const events = [
    { day: 3, out: 25000 },
    { day: Math.max(0, 7 - karimDelay), out: 35000 },
    { day: Math.max(1, 11 - muraliEarly), in: 15000, out: 12400 },
    { day: 14, in: 8000 },
    { day: 15, out: 8000 },
    { day: 18, out: 3200 },
    { day: 23, in: 32000 }
  ];
  let d2z = 45;
  for (let i = 0; i < 45; i++) {
    for (const e of events) {
      if (Math.floor(e.day) === i) {
        cash += (e.in || 0) - (e.out || 0);
      }
    }
    if (cash < buf && d2z === 45) {
      d2z = i;
      break;
    }
  }
  return d2z;
};

export const calculateObligationScore = (
  amt: number,
  relLevel: string,
  flexLevel: string
) => {
  const relMap: any = { new: 0, medium: 1, long: 3 };
  const flexMap: any = { none: 0, low: 2, medium: 5, high: 8 };
  const relYrs = relMap[relLevel] || 0;
  const flex = flexMap[flexLevel] || 0;
  
  // Custom formula from the prototype
  const sc = ((10 * 0.35) + (5 * 0.30) + (flex / 10 * 10 * 0.20) + (amt / 50000 * 10 * 0.15)).toFixed(1);
  return { score: parseFloat(sc), relYrs, flexScore: flex };
};
