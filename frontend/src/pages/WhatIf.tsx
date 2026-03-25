import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const WhatIf = () => {
  const [params, setParams] = useState({ bal: 80000, muraliEarly: 0, karimDelay: 0, loanDraw: 0, buf: 10000 });
  const [d2z, setD2z] = useState(14);
  const [explain, setExplain] = useState('Current scenario: Oct 14 remains the critical tight day.');

  useEffect(() => {
    fetch('http://localhost:5001/api/dashboard/whatif', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }).then(r => r.json()).then(data => {
      setD2z(data.d2z);
      
      const explains = [];
      if (params.muraliEarly > 0) explains.push(`Murali paying ${params.muraliEarly} day(s) early pulls ₹15,000 inflow forward.`);
      if (params.karimDelay > 0) explains.push(`Karim delay of ${params.karimDelay} day(s) removes Oct pressure.`);
      if (params.loanDraw > 0) explains.push(`Drawing ₹${params.loanDraw.toLocaleString('en-IN')} from Suresh adds buffer.`);
      if (explains.length === 0) explains.push('No adjustments. Oct 14 remains the tight day.');
      explains.push(`Projected runway: ${data.d2z} days with safety buffer ₹${params.buf.toLocaleString('en-IN')}.`);
      setExplain(explains.join(' '));
    }).catch(e => console.error(e));
  }, [params]);

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title syne">What-if simulator</div>
          <div className="page-subtitle">ADJUST VARIABLES · INSTANT D2Z RECALCULATION</div>
        </div>
      </div>
      <div className="wi-card">
        <div style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Adjust scenario parameters</div>
        <div className="wi-row"><span className="wi-label">Current bank balance (₹)</span><input className="wi-input" type="number" value={params.bal} onChange={e=>setParams({...params, bal:parseInt(e.target.value)||0})} /></div>
        <div className="wi-row"><span className="wi-label">Murali payment (days early)</span><input className="wi-input" type="number" min="0" max="7" value={params.muraliEarly} onChange={e=>setParams({...params, muraliEarly:parseInt(e.target.value)||0})} /></div>
        <div className="wi-row"><span className="wi-label">Karim Fabrics delay (days)</span><input className="wi-input" type="number" min="0" max="14" value={params.karimDelay} onChange={e=>setParams({...params, karimDelay:parseInt(e.target.value)||0})} /></div>
        <div className="wi-row"><span className="wi-label">Draw from Suresh loan (₹)</span><input className="wi-input" type="number" min="0" max="20000" value={params.loanDraw} onChange={e=>setParams({...params, loanDraw:parseInt(e.target.value)||0})} /></div>
        <div className="wi-row"><span className="wi-label">Safety buffer threshold (₹)</span><input className="wi-input" type="number" value={params.buf} onChange={e=>setParams({...params, buf:parseInt(e.target.value)||0})} /></div>
        <div className="wi-result-box">
          <div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "JetBrains Mono", marginBottom: 3 }}>PROJECTED DAYS TO ZERO</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "JetBrains Mono" }}>Based on your adjustments</div>
          </div>
          <div className="wi-result-val" style={{ color: d2z >= 30 ? 'var(--green)' : d2z >= 15 ? 'var(--amber)' : 'var(--red)' }}>{d2z} days</div>
        </div>
        <div className="wi-explain">{explain}</div>
      </div>
    </div>
  );
};
