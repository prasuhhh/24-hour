import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppContext } from '../context/AppContext';
import { Dashboard } from '../pages/Dashboard.tsx';
import { Obligations } from '../pages/Obligations.tsx';
import { ImportPage } from '../pages/ImportPage.tsx';
import { Loans } from '../pages/Loans.tsx';
import { GST } from '../pages/GST.tsx';
import { Receivables } from '../pages/Receivables.tsx';
import { WhatIf } from '../pages/WhatIf.tsx';
import { Scenarios } from '../pages/Scenarios.tsx';

export const Layout = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const { fetchData } = useAppContext();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard navigate={setActivePage} />;
      case 'upload': return <ImportPage />;
      case 'obligations': return <Obligations />;
      case 'loans': return <Loans />;
      case 'gst': return <GST />;
      case 'receivables': return <Receivables />;
      case 'whatif': return <WhatIf />;
      case 'scenarios': return <Scenarios />;
      default: return <div className="page active"><div className="page-header"><div className="page-title syne">Coming Soon</div></div></div>;
    }
  };

  return (
    <div className="shell">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="main">
        <Topbar />
        {renderPage()}
      </div>
    </div>
  );
};
