import { useAppContext } from '../context/AppContext';

export const Sidebar = ({ activePage, setActivePage }: any) => {
  const { dashboardState, obligations } = useAppContext();
  const gstOb = obligations?.find((o: any) => o.type === 'gst');
  const daysCount = gstOb ? gstOb.daysUntil : 0;
  const displayDays = daysCount < 10 ? `0${daysCount}` : daysCount.toString();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-row">
          <div className="brand-mark">
            <svg viewBox="0 0 20 20" fill="none"><path d="M3 10C3 6.13 6.13 3 10 3s7 3.13 7 7-3.13 7-7 7-7-3.13-7-7z" stroke="#000" strokeWidth="1.5"/><path d="M10 6v4l3 2" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div className="brand-name">ThavanAI</div>
            <div className="brand-tag">cash intelligence</div>
          </div>
        </div>
      </div>

      <div className="biz-panel">
        <div className="biz-name">Senthil Garments</div>
        <div className="biz-loc">retail · T. Nagar, Chennai</div>
        <div className="biz-balance-label">current balance</div>
        <div className="biz-balance">₹{dashboardState.bankBalance.toLocaleString('en-IN')}</div>
      </div>

      <nav className="nav">
        <div className="nav-section-label">Overview</div>
        <div className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>
          <svg className="ni" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1"/></svg>
          Dashboard
        </div>
        <div className={`nav-item ${activePage === 'upload' ? 'active' : ''}`} onClick={() => setActivePage('upload')}>
          <svg className="ni" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 4l3-3 3 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 10v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
          Import data
          <span className="nbadge amber">new</span>
        </div>

        <div className="nav-section-label">Money out</div>
        <div className={`nav-item ${activePage === 'obligations' ? 'active' : ''}`} onClick={() => setActivePage('obligations')}>
          <svg className="ni" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M2 7h7M2 10h9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
          Obligations
        </div>
        <div className={`nav-item ${activePage === 'loans' ? 'active' : ''}`} onClick={() => setActivePage('loans')}>
          <svg className="ni" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.1"/><path d="M7 4.5V7l2 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
          Informal loans
        </div>
        <div className={`nav-item ${activePage === 'gst' ? 'active' : ''}`} onClick={() => setActivePage('gst')}>
          <svg className="ni" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/><path d="M5 7h4M7 5v4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
          GST compliance
          {gstOb && <span className="nbadge amber">{daysCount}d</span>}
        </div>

        <div className="nav-section-label">Money in</div>
        <div className={`nav-item ${activePage === 'receivables' ? 'active' : ''}`} onClick={() => setActivePage('receivables')}>
          <svg className="ni" viewBox="0 0 14 14" fill="none"><path d="M7 13V5M4 8l3-3 3 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Receivables
        </div>

        <div className="nav-section-label">Tools</div>
        <div className={`nav-item ${activePage === 'whatif' ? 'active' : ''}`} onClick={() => setActivePage('whatif')}>
          <svg className="ni" viewBox="0 0 14 14" fill="none"><path d="M2 12L12 2M6 2h6v6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          What-if simulator
        </div>
        <div className={`nav-item ${activePage === 'scenarios' ? 'active' : ''}`} onClick={() => setActivePage('scenarios')}>
          <svg className="ni" viewBox="0 0 14 14" fill="none"><path d="M2 7h3l2-4 2 8 2-4h1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Scenario compare
        </div>
      </nav>

      <div className="sidebar-footer">
        {gstOb && (
          <div className="gst-block">
            <div className="gst-top">
              <div className="gst-dot"></div>
              <div className="gst-label">{gstOb.name.split(' ')[0]}</div>
            </div>
            <div className="gst-countdown mono">{displayDays}<span style={{fontSize:'13px',opacity:0.6}}> days</span></div>
            <div className="gst-detail">Est. liability <span style={{color:'var(--amber)',fontWeight:600}}>₹{gstOb.amount.toLocaleString('en-IN')}</span></div>
          </div>
        )}
      </div>
    </aside>
  );
};
