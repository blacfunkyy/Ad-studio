import React, { useState, useEffect } from 'react';
import DashboardPage from './pages/DashboardPage';
import AdsPage from './pages/AdsPage';
import AdTemplatesPage from './pages/AdTemplatesPage';
import SettingsPage from './pages/SettingsPage';
import ClientManagementPage from './pages/ClientManagementPage';
import CreatorPage from './App';

const Router: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderPage = () => {
    if (hash.startsWith('#edit/')) {
      const adId = hash.split('/')[1];
      return <CreatorPage adId={adId} />;
    }
    
    if (hash.startsWith('#template/')) {
        const templateId = hash.split('/')[1];
        return <CreatorPage templateId={templateId} />;
    }

    switch (hash) {
      case '#create':
        return <CreatorPage />;
      case '#ads':
        return <AdsPage />;
      case '#templates':
        return <AdTemplatesPage />;
      case '#settings':
        return <SettingsPage />;
      case '#clients':
        return <ClientManagementPage />;
      case '#dashboard':
      default:
        return <DashboardPage />;
    }
  };

  return <>{renderPage()}</>;
};

export default Router;