export let obligations = [
  { id: 1, name: 'Landlord (shop rent)', type: 'rent', amount: 25000, dueDate: 'Oct 10', daysUntil: 3, penaltyScore: 10, urgencyScore: 9, flexScore: 1, relYears: 5, relType: 'landlord', flexHistory: 'never', score: 9.1, relCritical: false },
  { id: 2, name: 'Karim Fabrics', type: 'supplier', amount: 35000, dueDate: 'Oct 14', daysUntil: 7, penaltyScore: 8, urgencyScore: 7, flexScore: 7, relYears: 3, relType: 'supplier', flexHistory: 'twice', score: 7.6, relCritical: false },
  { id: 3, name: 'GST-R3B October', type: 'gst', amount: 12400, dueDate: 'Oct 20', daysUntil: 13, penaltyScore: 10, urgencyScore: 6, flexScore: 0, relYears: 0, relType: 'government', flexHistory: 'never', score: 7.2, relCritical: false },
  { id: 4, name: 'Raja Packaging', type: 'supplier', amount: 8000, dueDate: 'Oct 22', daysUntil: 15, penaltyScore: 4, urgencyScore: 5, flexScore: 8, relYears: 1, relType: 'supplier', flexHistory: 'once', score: 4.8, relCritical: false },
  { id: 5, name: 'Electricity board', type: 'utility', amount: 3200, dueDate: 'Oct 25', daysUntil: 18, penaltyScore: 6, urgencyScore: 4, flexScore: 2, relYears: 0, relType: 'utility', flexHistory: 'none', score: 4.6, relCritical: false }
];

export let receivables = [
  { id: 1, name: 'Customer Murali (wholesale)', amount: 15000, expectedDate: 'Oct 18', daysUntil: 11, confidence: 92, status: 'confirmed' },
  { id: 2, name: 'Retail advance (Priya)', amount: 8000, expectedDate: 'Oct 21', daysUntil: 14, confidence: 78, status: 'verbal' },
  { id: 3, name: 'Saravana Stores (B2B)', amount: 32000, expectedDate: 'Oct 30', daysUntil: 23, confidence: 65, status: 'invoice_sent' }
];

export let loans = [
  { id: 1, lender: 'Cousin Suresh', type: 'family', total: 20000, available: 20000, borrowed: 'Oct 1', window: 60, relCritical: true, note: 'No fixed date. Personal favour. Repay when stable.' },
  { id: 2, lender: 'Rajan (friend, shop owner)', type: 'friend', total: 10000, available: 10000, borrowed: 'Sep 15', window: 90, relCritical: false, note: 'Agreed to repay by year end. Low pressure.' }
];

export let parsedTransactions: any[] = [];
export let dashboardState = {
  currentD2Z: 14,
  bankBalance: 80000
};
