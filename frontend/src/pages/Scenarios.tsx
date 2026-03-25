import { useState } from 'react';

export const Scenarios = () => {
  const [selected, setSelected] = useState(0);
  const reasons = [
    'Scenario A maximises runway by combining Murali early nudge and Karim extension. Best outcome: 22 days.',
    'Scenario B uses the Suresh buffer draw to resolve the Oct 14 shortfall. Runway: 17 days. Preserves supplier relationship.',
    'Scenario C does nothing. Worst case: cash goes negative on Oct 14. Not recommended.'
  ];

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title syne">Scenario comparator</div>
          <div className="page-subtitle">3 PAYMENT ORDERINGS · PROJECTED RUNWAY · PICK BEST</div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-header"><span className="card-title syne">Payment ordering scenarios</span><span className="mono" style={{ fontSize: 10, color: 'var(--text3)' }}>tap a scenario to select</span></div>
        <div className="card-body">
          <div className="scenario-grid">
            <div className={`scenario-card ${selected === 0 ? 'selected' : ''}`} onClick={() => setSelected(0)}>
              <div className="scenario-rank mono">SCENARIO A · RECOMMENDED</div>
              <div className="scenario-d2z best mono">22 days</div>
              <div className="scenario-order">1. Rent (Oct 10)<br/>2. Karim extension → Oct 19<br/>3. GST (Oct 20)<br/>4. Murali nudge early → Oct 13</div>
            </div>
            <div className={`scenario-card ${selected === 1 ? 'selected' : ''}`} onClick={() => setSelected(1)}>
              <div className="scenario-rank mono">SCENARIO B</div>
              <div className="scenario-d2z mid mono">17 days</div>
              <div className="scenario-order">1. Rent (Oct 10)<br/>2. GST (Oct 20)<br/>3. Karim Fabrics (Oct 14)<br/>4. Draw Suresh loan ₹11k</div>
            </div>
            <div className={`scenario-card ${selected === 2 ? 'selected' : ''}`} onClick={() => setSelected(2)}>
              <div className="scenario-rank mono">SCENARIO C · WORST</div>
              <div className="scenario-d2z worst mono">8 days</div>
              <div className="scenario-order">1. Karim Fabrics (Oct 14)<br/>2. Rent (Oct 10)<br/>3. GST (Oct 20)<br/>4. No adjustments</div>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--accent)', fontFamily: "JetBrains Mono", marginBottom: 4 }}>SELECTED: SCENARIO {['A','B','C'][selected]} · AI REASONING</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{reasons[selected]}</div>
          </div>
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => alert(`Scenario ${['A','B','C'][selected]} Approved!\n\nThe AI Email Drafter is preparing the outbound queue to contact করিম Fabrics and Customer Murali.`)}>Approve scenario {['A','B','C'][selected]} — draft all emails</button>
        </div>
      </div>
    </div>
  );
};
