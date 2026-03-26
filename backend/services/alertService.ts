import { GoogleGenerativeAI } from '@google/generative-ai';
import { obligations, receivables, parsedTransactions } from '../data/mockData';

export const generateAlerts = async () => {
  if (!process.env.GEMINI_API_KEY) {
    console.log("[ALERT ENGINE] Using Mock Alerts (No Key)");
    return [
      {
        metric: "Cash Flow",
        type: "upward_trend",
        severity: "low",
        message: "Consistent 12% growth in receivables",
        insight: "Your bulk import of 8 transactions strengthened the baseline.",
        action: "No action needed. Keep maintaining current collections."
      },
      {
        metric: "Upcoming Outflow",
        type: "anomaly",
        severity: "medium",
        message: "Rent and GST converge on Oct 14",
        insight: "Common peak day for small businesses.",
        action: "Consider drawing 5k from Suresh loan if murali is late."
      }
    ];
  }

  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview£" });

  const context = {
    obligations: obligations.map(o => ({ name: o.name, amount: o.amount, dueDate: o.dueDate })),
    receivables: receivables.map(r => ({ name: r.name, amount: r.amount, expectedDate: r.expectedDate })),
    recentTransactions: parsedTransactions.slice(0, 10).map(t => ({ desc: t.desc, amount: t.amount, type: t.type, date: t.date }))
  };

  const prompt = `
    You are a trend-based alert engine.
    Analyze the following business data and generate ONLY meaningful alerts based on patterns, changes, or anomalies.

    STRICT RULES:
    - Do NOT explain the data broadly
    - Do NOT give general advice
    - ONLY output alerts if a clear trend or anomaly is detected
    - If nothing important is found, return exactly: "No alerts"

    FOCUS ONLY ON:
    1. Sudden increases or decreases (spikes/drops)
    2. Consistent upward or downward trends
    3. Deviations from normal patterns (baseline behavior)

    DATA:
    ${JSON.stringify(context)}

    OUTPUT FORMAT (STRICT JSON):
    [
      {
        "metric": "<name of the metric>",
        "type": "spike | drop | upward_trend | downward_trend | anomaly",
        "severity": "high | medium | low",
        "message": "What changed",
        "insight": "Why this is happening based on trend",
        "action": "What the user should do next"
      }
    ]

    CONSTRAINTS:
    - Max 3 alerts
    - Prioritize highest impact changes
    - Use numbers or comparisons when possible (%, averages, etc.)
    - Keep messages sharp and specific
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    if (responseText.includes("No alerts")) {
      return [];
    }

    // Clean up potential markdown wrappers
    const jsonStr = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("[ALERT ENGINE] Error generating alerts:", error);
    return [];
  }
};
