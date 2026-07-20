const NAV_ITEMS = [
  { id: 'dashboard', icon: '🌙', label: 'Dashboard', badge: null },
  { id: 'schedule', icon: '⏰', label: 'Sleep Schedule', badge: null },
  { id: 'restrictions', icon: '🔒', label: 'App Restrictions', badge: '12' },
  { id: 'reports', icon: '📊', label: 'Sleep Reports', badge: null },
  { id: 'settings', icon: '⚙️', label: 'Settings', badge: null },
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🌛</div>
        <div className="logo-name">HypoTech</div>
        <div className="logo-tagline">Smart Sleep Guardian</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sleep-status-mini">
          <div className="status-dot" />
          <div className="status-text">
            <strong>Monitoring Active</strong>
            Sleep mode at 10:00 PM
          </div>
        </div>
      </div>
    </aside>
  );
}
