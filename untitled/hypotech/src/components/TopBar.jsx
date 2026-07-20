import { useState, useEffect } from 'react';

const PAGE_INFO = {
  dashboard: {
    title: 'Sleep Dashboard',
    sub: 'Overview of your sleep health & restrictions',
  },
  schedule: {
    title: 'Sleep Schedule',
    sub: 'Configure your nightly sleep windows',
  },
  restrictions: {
    title: 'App Restrictions',
    sub: 'Manage which apps are blocked during sleep',
  },
  reports: { title: 'Sleep Reports', sub: 'Detailed analytics & trends' },
  settings: { title: 'Settings', sub: 'Preferences, notifications & account' },
};

export default function TopBar({ activePage }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const info = PAGE_INFO[activePage] || PAGE_INFO.dashboard;

  const formatTime = (d) =>
    d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

  const formatDate = (d) =>
    d.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{info.title}</div>
        <div className="topbar-subtitle">{info.sub}</div>
      </div>
      <div className="topbar-right">
        <div style={{ textAlign: 'right' }}>
          <div className="topbar-time">{formatTime(time)}</div>
          <div className="topbar-date">{formatDate(time)}</div>
        </div>
        <div className="icon-btn" title="Notifications">
          🔔
        </div>
        <div className="avatar" title="Profile">
          AK
        </div>
      </div>
    </header>
  );
}
