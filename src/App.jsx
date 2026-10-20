import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ClientView from './components/ClientView/ClientView';
import AdminPanel from './components/AdminPanel/AdminPanel';
import FloatingHelpButton from './components/FloatingHelpButton';
import PwaInstallBanner from './components/PwaInstallBanner';
import { api, getClientToken, getAdminToken } from './services/api';

export default function App() {
  const [activeView, setActiveView] = useState('client'); // 'client' | 'admin'
  const [clientSubTab, setClientSubTab] = useState('club'); // 'club' | 'book' | 'turns'

  const [loggedClient, setLoggedClient] = useState(null);
  const [clientAppointments, setClientAppointments] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [studioConfig, setStudioConfig] = useState({});

  const refreshClientSession = useCallback(async () => {
    if (!getClientToken()) return;
    try {
      const res = await api.getClientMe();
      setLoggedClient(res.client);
      setClientAppointments(res.appointments || []);
    } catch {
      api.logoutClient();
      setLoggedClient(null);
      setClientAppointments([]);
    }
  }, []);

  const refreshAdminSession = useCallback(async () => {
    if (!getAdminToken()) return;
    try {
      const res = await api.getAdminMe();
      setAdminUser(res.admin);
    } catch {
      api.logoutAdmin();
      setAdminUser(null);
    }
  }, []);

  useEffect(() => {
    api.getBootstrap()
      .then((res) => {
        if (res.config) setStudioConfig(res.config);
      })
      .catch(() => {});

    refreshClientSession();
    refreshAdminSession();
  }, [refreshClientSession, refreshAdminSession]);

  // Periodically refresh active client session so live confirmations update points & turns
  useEffect(() => {
    if (!loggedClient) return;
    const interval = setInterval(refreshClientSession, 5000);
    return () => clearInterval(interval);
  }, [loggedClient, refreshClientSession]);

  const handleLogoutClient = () => {
    api.logoutClient();
    setLoggedClient(null);
    setClientAppointments([]);
  };

  const handleLogoutAdmin = () => {
    api.logoutAdmin();
    setAdminUser(null);
    setActiveView('client');
  };

  return (
    <div className="min-h-screen flex flex-col bg-barber-lightBg dark:bg-barber-darkBg text-barber-lightText dark:text-barber-darkText transition-colors duration-200">
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        clientSubTab={clientSubTab}
        setClientSubTab={setClientSubTab}
        loggedClient={loggedClient}
        onLogoutClient={handleLogoutClient}
        adminUser={adminUser}

        onLogoutAdmin={handleLogoutAdmin}
        pendingCount={pendingCount}
      />

      <PwaInstallBanner />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-6 sm:pt-8">
        {activeView === 'client' ? (
          <ClientView
            subTab={clientSubTab}
            setSubTab={setClientSubTab}
            loggedClient={loggedClient}
            clientAppointments={clientAppointments}
            onAuthSuccess={(client, apts) => {
              setLoggedClient(client);
              setClientAppointments(apts || []);
            }}
            onAdminAuthSuccess={(admin) => {
              setAdminUser(admin);
              setActiveView('admin');
            }}
            onLogoutClient={handleLogoutClient}
            onRefreshClientSession={refreshClientSession}
            studioConfig={studioConfig}
          />
        ) : (
          <AdminPanel
            adminUser={adminUser}

            onAdminLoginSuccess={(admin) => setAdminUser(admin)}
            onAdminLogout={handleLogoutAdmin}
            onPendingCountChange={setPendingCount}
          />
        )}
      </main>

      <FloatingHelpButton studioConfig={studioConfig} />

      <Footer
        onOpenAdmin={() => setActiveView(activeView === 'admin' ? 'client' : 'admin')}
        adminUser={adminUser}

      />
    </div>
  );
}
