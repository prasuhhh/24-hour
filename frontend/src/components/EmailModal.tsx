import React, { useState, useEffect } from 'react';

export const EmailModal = ({ isOpen, onClose, obId, recName, recAmount }: any) => {
  const [emailText, setEmailText] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmailText('');
      setTyping(true);
      fetch('http://localhost:5001/api/ai/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ obId, recName, recAmount })
      })
      .then(r => r.json())
      .then(data => {
        if (data.text) {
          // Typewriter effect
          let i = 0;
          const text = data.text;
          const interval = setInterval(() => {
            setEmailText(prev => prev + text.charAt(i));
            i++;
            if (i >= text.length - 1) { // text.length - 1 to handle exact bounds safely
              clearInterval(interval);
              setTyping(false);
            }
          }, 15);
        } else if (data.error) {
          setEmailText(data.error);
          setTyping(false);
        }
      })
      .catch(e => {
        setEmailText('Error generating email.');
        setTyping(false);
      });
    }
  }, [isOpen, obId, recName, recAmount]);

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="syne" style={{ fontSize: 16, fontWeight: 700 }}>AI Email Drafter</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 20 }}>&times;</button>
        </div>
        <div className="email-preview" style={{ background: 'var(--surface2)', padding: 16, borderRadius: 8, border: '1px solid var(--border)', minHeight: 150 }}>
          <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'Inter', fontSize: 13, lineHeight: 1.6, color: 'var(--text2)' }}>
            {emailText}
            {typing && <span className="cursor-blink" style={{ borderRight: '2px solid var(--accent)', animation: 'blink 1s step-end infinite', marginLeft: 2 }}>&nbsp;</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn-primary" style={{ flex: 1 }} disabled={typing} onClick={() => { alert('Handed off to Gmail App!'); onClose(); }}>Send via Gmail</button>
        </div>
      </div>
    </div>
  );
};
