
export const GST = () => {
  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title syne">GST compliance</div>
          <div className="page-subtitle">FILING COUNTDOWN · LIABILITY ESTIMATOR · ALERTS</div>
        </div>
      </div>
      <div className="gst-deadline-card">
        <div>
          <div className="gst-type syne">GST-R3B Filing</div>
          <div className="gst-due-date mono">Due: 20th October 2025</div>
          <div style={{ marginTop: 16, fontSize: 11, color: 'var(--amber)', opacity: 0.8 }}>Days remaining</div>
          <div className="gst-big-countdown mono">08</div>
          <div className="gst-countdown-label mono">days · 07 hours · 23 mins</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: "JetBrains Mono", marginBottom: 4 }}>STATUS</div>
          <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: 'var(--amber)', fontFamily: "JetBrains Mono" }}>AMBER · WATCH</div>
        </div>
      </div>

      <div className="gst-liability-row">
        <div className="gst-lcard">
          <div className="gst-lcard-label">Output tax (sales)</div>
          <div className="gst-lcard-val" style={{ color: 'var(--red)' }}>₹18,600</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: "JetBrains Mono", marginTop: 2 }}>Based on 12 invoices this month</div>
        </div>
        <div className="gst-lcard">
          <div className="gst-lcard-label">Input credit (purchases)</div>
          <div className="gst-lcard-val" style={{ color: 'var(--green)' }}>₹6,200</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: "JetBrains Mono", marginTop: 2 }}>7 purchase invoices with GST</div>
        </div>
        <div className="gst-lcard">
          <div className="gst-lcard-label">Net liability estimate</div>
          <div className="gst-lcard-val" style={{ color: 'var(--amber)' }}>₹12,400</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: "JetBrains Mono", marginTop: 2 }}>±15% margin · confirm with CA</div>
        </div>
        <div className="gst-lcard">
          <div className="gst-lcard-label">Cash available to pay</div>
          <div className="gst-lcard-val" style={{ color: 'var(--green)' }}>₹80,000</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: "JetBrains Mono", marginTop: 2 }}>Sufficient for GST payment</div>
        </div>
      </div>

      <div className="section-lbl">Alert timeline</div>
      <div className="gst-alert-bar a7"><span className="mono">7 DAYS</span><span>Informational — GST due in one week. Estimate calculated.</span></div>
      <div className="gst-alert-bar a3"><span className="mono">3 DAYS</span><span>Warning — Verify liability with CA. Ensure cash reserved.</span></div>
      <div className="gst-alert-bar a1"><span className="mono">1 DAY</span><span style={{ fontWeight: 700 }}>Critical — File tomorrow. Direct link to GST portal below.</span></div>

      <div style={{ marginTop: 14 }}>
        <div className="section-lbl">Upcoming GST deadlines</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div className="stat-card amber"><div className="stat-label">GST-R3B (monthly)</div><div className="stat-value" style={{ fontSize: 14 }}>Oct 20</div><div className="stat-sub mono" style={{ fontSize: 9 }}>8 days · ₹12,400</div></div>
          <div className="stat-card blue"><div className="stat-label">GST-R1 (monthly)</div><div className="stat-value" style={{ fontSize: 14 }}>Nov 11</div><div className="stat-sub mono" style={{ fontSize: 9 }}>30 days</div></div>
          <div className="stat-card blue"><div className="stat-label">GST-R3B (November)</div><div className="stat-value" style={{ fontSize: 14 }}>Nov 20</div><div className="stat-sub mono" style={{ fontSize: 9 }}>39 days</div></div>
        </div>
      </div>

      <button className="gst-portal-btn">File on GST Portal →</button>
    </div>
  );
};
