import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';



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
import { generateAlerts } from '../services/alertService';


const router = Router();

// Dashboard Endpoint
router.get('/dashboard', (req, res) => {
  res.json({
    dashboardState,
    obligations: obligations, // return all so Obligations page works
    receivables,
    loans
  });
});

// Alerts
router.get('/alerts', async (req, res) => {
  const alerts = await generateAlerts();
  res.json(alerts);
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
  const loanTotal = Number(total);
  const newLoan = {
    id: loans.length + 1,
    lender,
    type,
    total: loanTotal,
    available: loanTotal,
    borrowed: 'Today',
    window: window || 60,
    relCritical: !!relCritical,
    note: note || 'No notes.'
  };
  loans.push(newLoan);
  dashboardState.bankBalance += loanTotal;
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
    let amount = 0;
    let desc = 'Extracted Transaction';
    let type = 'payable';
    const ext = fileName.toLowerCase();
    const isSpreadsheet = ext.endsWith('.xlsx') || ext.endsWith('.xls') || ext.endsWith('.csv');

    // SMART SPREADSHEET PARSER (AI Column Mapping + Fallbacks)
    if (isSpreadsheet) {
      console.log(`[OCR ENGINE] Running Smart Spreadsheet Parser on ${fileName}...`);
      const XLSX = require('xlsx');
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      let amountCol = '';
      let descCol = '';

      if (data.length > 0) {
        const sample = data.slice(0, 3);
        const cols = Object.keys(data[0] as object);

        // 1. Attempt AI Column Mapping
        if (process.env.GEMINI_API_KEY) {
          try {
            const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const prompt = `Identify column names for 'merchant' and 'amount' in this JSON array sample: ${JSON.stringify(sample)}. Return ONLY JSON: {"merchant": "ColumnName1", "amount": "ColumnName2"}.`;
            const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview" });
            const response = await model.generateContent(prompt);
            const text = response.response.text();
            const mapping = JSON.parse(text);
            amountCol = mapping.amount;
            descCol = mapping.merchant;
            console.log(`[OCR ENGINE] Spreadsheet AI Mapping found:`, mapping);
          } catch (e) { console.error(`[OCR ENGINE] Spreadsheet AI Mapping failed`, e); }
        }

        // 2. Emergency Dictionary Fallback
        if (!amountCol) {
          for (const c of cols) {
            const cl = c.toLowerCase();
            if (/amt|amount|price|total|cost|value|₹|\$/i.test(cl)) amountCol = c;
            if (/vendor|merchant|desc|store|name|particular|party/i.test(cl)) descCol = c;
          }
          console.log(`[OCR ENGINE] Fallback Mapping applied: amount=${amountCol}, merchant=${descCol}`);
        }

        // 3. Extract all Rows (Bulk Import)
        if (amountCol) {
          const newEntries: any[] = [];
          for (const r of data) {
            const rowAmt = parseFloat(String(r[amountCol]).replace(/[^0-9.-]+/g, ""));
            const rowDesc = descCol && r[descCol] ? String(r[descCol]).substring(0, 30) : 'Extracted Entry';

            if (isNaN(rowAmt) || rowAmt <= 0) continue;
            if (/total|sum|balance/i.test(rowDesc)) continue; // skip the summary row

            // For now, if no logic dictates type from spreadsheet, assume it's payable if it's uploaded to tracking.
            const rowType = type; // Defaults to 'payable' in initial declaration

            const parsed = {
              id: Date.now() + Math.random(),
              desc: rowDesc,
              amount: rowAmt,
              type: rowType,
              date: new Date().toISOString().split('T')[0],
              source: fileName
            };

            if (rowType === 'receivable') {
              dashboardState.bankBalance += rowAmt;
              const expectedDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              receivables.push({
                id: receivables.length + 1,
                name: rowDesc,
                amount: rowAmt,
                expectedDate,
                daysUntil: 14,
                confidence: 80,
                status: 'auto_parsed'
              });
            } else if (rowType === 'payable') {
              dashboardState.bankBalance -= rowAmt;
              const { score, relYrs, flexScore } = calculateObligationScore(rowAmt, 'med', 'med');
              const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              const newOb = {
                id: obligations.length + 1,
                name: rowDesc,
                type: 'supplier',
                amount: rowAmt,
                dueDate,
                daysUntil: 14,
                penaltyScore: 5,
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
            }
            parsedTransactions.unshift(parsed);
            newEntries.push(parsed);
          }
          if (newEntries.length > 0) {
            return res.json(newEntries[0]); // Return first to satisfy frontend single-object expectation, or refactor frontend.
          }
        }
      }
    }
    // THE MOST EFFECTIVE TECHNIQUE: Multimodal LLM Parsing for Documents and Images
    else if (process.env.GEMINI_API_KEY) {
      console.log(`[OCR ENGINE] Using Gemini 1.5 Multimodal AI for advanced parsing of ${fileName}...`);
      try {
        const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const b64 = fs.readFileSync(filePath).toString('base64');
        const mimeType = ext.endsWith('.pdf') ? 'application/pdf' : ext.endsWith('.png') ? 'image/png' : 'image/jpeg';

        const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent([
          { inlineData: { data: b64, mimeType } },
          "Extract the final total amount from this document. Also extract a brief 3-5 word description of the vendor or purpose. Return JSON EXACTLY like this: {\"amount\": 1500, \"desc\": \"Company Name / Purpose\", \"type\": \"payable\"} (type must be 'payable' if it's an invoice WE need to pay, or 'receivable' if it's money incoming to us). Do not include any markdown wrappers."
        ]);

        const aiData = JSON.parse(result.response.text());
        if (aiData.amount) amount = aiData.amount;
        if (aiData.desc) desc = aiData.desc;
        if (aiData.type) type = aiData.type;
        console.log(`[OCR ENGINE] Gemini success: ${amount} | ${desc}`);
      } catch (aiErr) {
        console.error(`[OCR ENGINE] Gemini parsing failed, falling back to local OCR pipeline...`, aiErr);
      }
    }

    // FALLBACK PIPELINE: Tesseract & PDFParse + Robust Regex
    if (!amount || amount === 0) {
      if (ext.endsWith('.pdf')) {
        const { PDFParse } = require('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        text = data.text;
        await parser.destroy();
      } else if (ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg')) {
        const Tesseract = require('tesseract.js');
        console.log(`[OCR ENGINE] Running Tesseract on image: ${fileName}...`);
        const result = await Tesseract.recognize(filePath, 'eng');
        text = result.data.text;
        console.log(`[OCR ENGINE] OCR complete.`);
      } else {
        text = fs.readFileSync(filePath, 'utf8');
      }

      // Regex Currency Parser
      const currencyPattern = /(?:total|amount|rs\.?|₹|\$|inr)\s*:?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)|(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:₹|\$|inr)/gi;
      const matches = [...text.matchAll(currencyPattern)];

      if (matches.length > 0) {
        const amounts = matches.map(m => parseFloat((m[1] || m[2]).replace(/,/g, '')));
        amount = Math.max(...amounts);
      }

      if (!amount || amount === 0) {
        const numbers = [...text.matchAll(/(?:\b\d{1,3}(?:,\d{3})+(?:\.\d{2})?\b)|(?:\b\d+(?:\.\d{2})\b)/g)]
          .map(m => parseFloat(m[0].replace(/,/g, '')));
        if (numbers.length > 0) amount = Math.max(...numbers);
      }

      if (!amount || amount === 0) {
        amount = Math.min(req.file.size, 99000); // Last resort fallback
      }

      type = /invoice|bill to|received|inflow/i.test(text) ? 'receivable' : 'payable';

      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
      if (lines.length > 0) {
        const descLine = lines.find(l => !l.match(/^\d+$/) && l.length > 5 && l.length < 40 && !l.toLowerCase().includes('total'));
        if (descLine) desc = descLine.substring(0, 30);
      }
    }

    const parsed = {
      id: Date.now(),
      desc,
      amount,
      type,
      date: new Date().toISOString().split('T')[0],
      source: fileName
    };

    if (type === 'receivable') {
      dashboardState.bankBalance += amount;
      const expectedDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const newRec = {
        id: receivables.length + 1,
        name: desc,
        amount,
        expectedDate: expectedDate,
        daysUntil: 14,
        confidence: 80,
        status: 'auto_parsed'
      };
      receivables.push(newRec);
    } else if (type === 'payable') {
      dashboardState.bankBalance -= amount;
      const { score, relYrs, flexScore } = calculateObligationScore(amount, 'med', 'med');
      const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const newOb = {
        id: obligations.length + 1,
        name: desc,
        type: 'supplier',
        amount,
        dueDate: dueDate,
        daysUntil: 14,
        penaltyScore: 5,
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
    }

    parsedTransactions.unshift(parsed);
    res.json(parsed);
  } catch (error) {
    console.error('OCR Parser Error:', error);
    res.status(500).json({ error: 'Failed to extract text from document.' });
  }
});

router.post('/transactions/manual', (req, res) => {
  const { desc, amount, type, date } = req.body;
  const txAmt = Number(amount);
  const tx = { desc, amount: txAmt, type, date: date || 'Oct 28', source: 'manual', id: Date.now() };

  if (type === 'receivable') {
    dashboardState.bankBalance += txAmt;
    const newRec = {
      id: receivables.length + 1,
      name: desc,
      amount: txAmt,
      expectedDate: date || 'Oct 28',
      daysUntil: 14,
      confidence: 80,
      status: 'manual_entry'
    };
    receivables.push(newRec);
  } else if (type === 'payable') {
    dashboardState.bankBalance -= txAmt;
    const { score, relYrs, flexScore } = calculateObligationScore(txAmt, 'med', 'med');
    const newOb = {
      id: obligations.length + 1,
      name: desc,
      type: 'supplier',
      amount: txAmt,
      dueDate: date || 'Oct 28',
      daysUntil: 14,
      penaltyScore: 5,
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
  }

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
    text = `Dear ${ob.name.split(' ')[0]},\n\nI hope all is well on your end! I'm reaching out about our payment of ₹${ob.amount} due ${ob.dueDate}. Some of my customers have been running a bit late with payments this month, which has tightened things slightly on my end.\n\nCould we kindly push this to ${ob.dueDate}? I will make absolutely sure it reaches you without fail — our 3 years of working together means a lot to me.\n\nThank you so much for your understanding and continued support.\n\nWarm regards,\nSenthil, Senthil Garments`;
  } else if (ob.type === 'gst' || ob.type === 'utility') {
    text = `[Note: GST and utility payments are non-negotiable. This obligation cannot be delayed. The system has marked it as priority 1.]`;
  } else {
    text = `Dear ${ob.name},\n\nI hope this message finds you well. I am writing regarding our payment of ₹${ob.amount} due ${ob.dueDate}.\n\nDue to a temporary delay in receivables from our customers, I would like to kindly request a 5-day extension on this payment. I assure you the full amount will be transferred promptly once received.\n\nThank you for your understanding and cooperation.\n\nRegards,\nSenthil\nSenthil Garments`;
  }

  res.json({ text });
});

// NL WhatIf Endpoint
router.post('/ai/whatif-nl', async (req, res) => {
  console.log('[DEBUG] NL WHATIF REQUEST RECEIVED');
  const { prompt, currentParams } = req.body;
  console.log(`[NL WHATIF] Hit: Prompt="${prompt}", KeyPresent=${!!process.env.GEMINI_API_KEY}`);
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: 'LLM not configured.' });

  try {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const instruction = `
You are a financial parameter extractor for a 'What if' Cashflow Simulator.
The current parameters are: ${JSON.stringify(currentParams)}.
Given this user sentence: "${prompt}"
Update the parameters accordingly.
- bal (Current bank balance, integer)
- muraliEarly (Murali payment days early, integer, max 7)
- karimDelay (Karim Fabrics delay days, integer, max 14)
- loanDraw (Draw from Suresh loan in rupees, integer, max 20000)
- buf (Safety buffer threshold in rupees, integer)
Return exactly a JSON object matching these 5 keys and their updated integer values based on the user's scenario. Do not include markdown wrappers like \`\`\`json.
`;
    const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(instruction);
    const newParams = JSON.parse(result.response.text());
    res.json(newParams);
  } catch (err) {
    console.error('NL WhatIf error:', err);
    res.status(500).json({ error: 'Failed to process NL WhatIf scenario' });
  }
});

export default router;
