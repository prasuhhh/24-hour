import { useAppContext } from '../context/AppContext';

export const Topbar = () => {
  const { mode, toggleMode, toggleTheme, dashboardState } = useAppContext();
  const d2z = dashboardState.currentD2Z;
  
  const pct = Math.min(100, Math.max(4, (d2z / 45) * 100));
  let zoneColor = 'var(--green)';
  let chipClass = 'd2z-chip green';
  if (d2z < 30) {
    zoneColor = 'var(--amber)';
    chipClass = 'd2z-chip amber';
  }
  if (d2z < 10) {
    zoneColor = 'var(--red)';
    chipClass = 'd2z-chip red';
  }

  return (
    <div className="topbar">
      <span className="runway-label">CASH RUNWAY</span>
      <div className="runway-track">
        <div className="runway-fill" style={{ width: `${pct}%`, background: zoneColor }}></div>
      </div>
      <div className={chipClass}>
        <div className="d2z-dot" style={{ background: zoneColor }}></div>
        <span className="mono">{d2z} days</span>
      </div>
      <div className="topbar-right">
        <div className="mode-toggle-wrap">
          <span className="mode-label">OPTIMISTIC</span>
          <div className={`toggle-pill ${mode === 'conservative' ? 'on' : ''}`} onClick={toggleMode}>
            <div className="toggle-thumb"></div>
          </div>
          <span className="mode-label">CONSERVATIVE</span>
        </div>
        <div className="theme-btn" onClick={toggleTheme} title="Toggle theme">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2"/><path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.6 3.4l-1.06 1.06M4.46 11.54l-1.06 1.06M12.6 12.6l-1.06-1.06M4.46 4.46L3.4 3.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
        </div>
      </div>
    </div>
  );
};
