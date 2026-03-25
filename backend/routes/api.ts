import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

import {
  obligations,
  receivables,
  loans,
  parsedTransactions,
  dashboardState
} from '../data/mockData';
import { recalculateD2Z, calculateObligationScore } from '../services/engine';

const router = Router();

// Dashboard Endpoint
router.get('/dashboard', (req, res) => {
  res.json({
    dashboardState,
    obligations: obligations.slice(0,3), // top 3 for dashboard
    receivables,
    loans
  });
});

// Obligations
router.get('/obligations', (req, res) => {
  res.json(obligations);
});

router.post('/obligations', (req, res) => {
  const { name, amount, dueDate, type, relLevel, flexLevel } = req.body;
  const { score, relYrs, flexScore } = calculateObligationScore(amount, relLevel, flexLevel);
  
  const newOb = {
    id: obligations.length + 1,
    name,
    type,
    amount,
    dueDate: dueDate || 'Oct 28',
    daysUntil: 21,
    penaltyScore: 6,
    urgencyScore: 5,
    flexScore,
    relYears: relYrs,
    relType: 'supplier',
    flexHistory: 'once',
    score,
    relCritical: false
  };

  obligations.push(newOb);
  obligations.sort((a, b) => b.score - a.score);
  obligations.forEach((o, i) => o.id = i + 1);

  res.json(newOb);
});

// Receivables
router.get('/receivables', (req, res) => {
  res.json(receivables);
});

router.post('/receivables', (req, res) => {
  const { name, amount, expectedDate, confidence } = req.body;
  const newRec = {
    id: receivables.length + 1,
    name,
    amount,
    expectedDate: expectedDate || 'Oct 28',
    daysUntil: 21,
    confidence: confidence || 70,
    status: 'manual_entry'
  };
  receivables.push(newRec);
  res.json(newRec);
});

// Loans
router.get('/loans', (req, res) => {
  res.json(loans);
});

router.post('/loans', (req, res) => {
  const { lender, type, total, window, relCritical, note } = req.body;
  const newLoan = {
    id: loans.length + 1,
    lender,
    type,
    total,
    available: total,
    borrowed: 'Today',
    window: window || 60,
    relCritical: !!relCritical,
    note: note || 'No notes.'
  };
  loans.push(newLoan);
  res.json(newLoan);
});

// Transactions & Parser
router.get('/transactions', (req, res) => {
  res.json(parsedTransactions);
});

router.post('/transactions/parse', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No physical file uploaded' });

  const fileName = req.file.originalname;
  const filePath = req.file.path;
  
  console.log(`[OCR ENGINE] Parsing physical file: ${fileName} from disk: ${filePath}`);

  try {
    let text = '';
    if (fileName.toLowerCase().endsWith('.pdf')) {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else {
      text = fs.readFileSync(filePath, 'utf8');
    }

    let amount = 0;
    const amountMatch = text.match(/(?:(?:total|amount|rs\.?|₹|\$)\s*:?\s*)?((?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})?)/i);
    if (amountMatch && amountMatch[1]) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    } 
    if (!amount || amount === 0) {
      const numbers = [...text.matchAll(/\b\d{2,7}(?:\.\d{2})?\b/g)].map(m => parseFloat(m[0]));
      if (numbers.length > 0) amount = Math.max(...numbers);
    }
    if (!amount || amount === 0) {
      amount = Math.min(req.file.size, 99000);
    }

    const type = /invoice|bill to|received|inflow/i.test(text) ? 'receivable' : 'payable';

    let desc = 'Extracted Transaction';
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    if (lines.length > 0) {
      const descLine = lines.find(l => !l.match(/^\d+$/) && l.length > 5 && l.length < 40 && !l.toLowerCase().includes('total'));
      if (descLine) desc = descLine.substring(0, 30);
    }

    const parsed = {
      id: Date.now(),
      desc,
      amount,
      type,
      date: new Date().toISOString().split('T')[0],
      source: fileName
    };
    
    parsedTransactions.unshift(parsed);
    res.json(parsed);
  } catch (error) {
    console.error('OCR Parser Error:', error);
    res.status(500).json({ error: 'Failed to extract text from document.' });
  }
});

router.post('/transactions/manual', (req, res) => {
  const { desc, amount, type, date } = req.body;
  const tx = { desc, amount, type, date: date || 'Oct 28', source: 'manual', id: Date.now() };
  parsedTransactions.push(tx);
  res.json(tx);
});

// Whatif Recalculation
router.post('/dashboard/whatif', (req, res) => {
  const { bal, muraliEarly, karimDelay, loanDraw, buf } = req.body;
  const d2z = recalculateD2Z(bal, muraliEarly, karimDelay, loanDraw, buf);
  res.json({ d2z });
});

// AI Draft Email
router.post('/ai/draft-email', (req, res) => {
  const { obId, recName, recAmount } = req.body;
  
  // If drafting nudge for receivable
  if (recName) {
    const text = `Dear ${recName.split('(')[0].trim()},\n\nI hope business is going well for you! Just a quick note about your payment of ₹${recAmount} expected around Oct 18.\n\nIf it's at all convenient, receiving it a few days earlier this cycle would be a great help to us. Completely understand if timing doesn't work — just thought I'd check!\n\nThank you as always for your continued support.\n\nWarm regards,\nSenthil, Senthil Garments`;
    return res.json({ text });
  }

  // If drafting delay for obligation
  const ob = obligations.find(o => o.id === obId);
  if (!ob) return res.status(404).json({ error: 'Obligation not found' });

  let text = '';
  if (ob.relYears >= 3) {
    text = `${ob.name.split(' ')[0]} bhai,\n\nHope all is well on your end! I'm reaching out about our payment of ₹${ob.amount} due ${ob.dueDate}. Some of my customers have been running a bit late with payments this month, which has tightened things slightly on my end.\n\nCould we push this to ${ob.dueDate}? I'll make sure it reaches you without fail — our 3 years of working together means a lot to me.\n\nThank you for your understanding.\n\nWarmly,\nSenthil, Senthil Garments`;
  } else if (ob.type === 'gst' || ob.type === 'utility') {
    text = `[Note: GST and utility payments are non-negotiable. This obligation cannot be delayed. The system has marked it as priority 1.]`;
  } else {
    text = `Dear ${ob.name},\n\nI hope this message finds you well. I am writing regarding our payment of ₹${ob.amount} due ${ob.dueDate}.\n\nDue to a temporary delay in receivables from our customers, I would like to kindly request a 5-day extension on this payment. I assure you the full amount will be transferred promptly once received.\n\nThank you for your understanding and cooperation.\n\nRegards,\nSenthil\nSenthil Garments`;
  }

  res.json({ text });
});

export default router;
