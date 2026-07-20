import { useState, useEffect } from 'react';
import { appsAPI } from '../services/api';

const CATEGORIES = [
  'All',
  'Social Media',
  'Entertainment',
  'Gaming',
  'Messaging',
  'Navigation',
  'Emergency',
];
const CATEGORY_ICONS = {
  'Social Media': '👥',
  Entertainment: '🎬',
  Gaming: '🎮',
  Messaging: '💬',
  Navigation: '🗺️',
  Emergency: '🚨',
  All: '📱',
};

export default function AppRestrictions() {
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    appsAPI
      .getAll()
      .then((data) => setApps(data.apps || []))
      .catch((e) => console.error('Apps load:', e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (id) => {
    setSaving(id);
    try {
      const res = await appsAPI.toggle(id);
      setApps((list) =>
        list.map((a) =>
          a.id === id ? { ...a, is_blocked: res.is_blocked } : a,
        ),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(null);
    }
  };

  const blockAll = async () => {
    await appsAPI.blockAll();
    setApps((list) =>
      list.map((a) =>
        a.category === 'Emergency' ? a : { ...a, is_blocked: 1 },
      ),
    );
  };
  const unblockAll = async () => {
    await appsAPI.unblockAll();
    setApps((list) => list.map((a) => ({ ...a, is_blocked: 0 })));
  };

  const filtered = apps.filter((a) => {
    const matchCat = filter === 'All' || a.category === filter;
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const blockedCount = apps.filter((a) => a.is_blocked).length;

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 300,
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: '2.5rem',
            animation: 'float 2s ease-in-out infinite',
          }}
        >
          🔒
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Loading apps...
        </div>
      </div>
    );

  return (
    <div>
      <div className="section-heading fade-up">App Restrictions</div>
      <div className="section-sub fade-up">
        Choose which websites get blocked during your sleep window.
      </div>

      <div className="grid-3 fade-up fade-up-1" style={{ marginBottom: 24 }}>
        <div
          className="card"
          style={{
            background:
              'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))',
            borderColor: 'rgba(99,102,241,0.3)',
          }}
        >
          <div className="card-title">Total Blocked</div>
          <div className="card-value" style={{ color: 'var(--aurora-1)' }}>
            {blockedCount}
          </div>
          <div className="card-sub">of {apps.length} apps</div>
        </div>
        <div
          className="card"
          style={{
            background:
              'linear-gradient(135deg,rgba(248,113,113,0.1),rgba(239,68,68,0.07))',
            borderColor: 'rgba(248,113,113,0.25)',
          }}
        >
          <div className="card-title">Extension Status</div>
          <div
            className="card-value"
            style={{ color: 'var(--warning)', fontSize: '1rem', marginTop: 8 }}
          >
            Install Chrome Extension
          </div>
          <div className="card-sub">to enable real blocking</div>
        </div>
        <div
          className="card"
          style={{
            background:
              'linear-gradient(135deg,rgba(52,211,153,0.1),rgba(16,185,129,0.07))',
            borderColor: 'rgba(52,211,153,0.25)',
          }}
        >
          <div className="card-title">Always Allowed</div>
          <div className="card-value" style={{ color: 'var(--success)' }}>
            {apps.length - blockedCount}
          </div>
          <div className="card-sub">emergency & essential</div>
        </div>
      </div>

      <div className="card fade-up fade-up-2" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <input
            className="form-input"
            placeholder="🔍  Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 240 }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                className={`time-chip ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
                style={{ display: 'flex', alignItems: 'center', gap: 5 }}
              >
                {CATEGORY_ICONS[cat]} {cat}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-danger" onClick={blockAll}>
              🔒 Block All
            </button>
            <button className="btn btn-success" onClick={unblockAll}>
              🔓 Allow All
            </button>
          </div>
        </div>
      </div>

      <div className="card fade-up fade-up-3">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <div className="card-title" style={{ margin: 0 }}>
            {filter === 'All' ? 'All Apps' : filter} ({filtered.length})
          </div>
          <span className="badge badge-purple">Night Mode Active</span>
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '32px',
              color: 'var(--text-muted)',
            }}
          >
            No apps found
          </div>
        ) : (
          filtered.map((app) => (
            <div className="app-row" key={app.id}>
              <div
                className="app-icon-wrap"
                style={{ background: 'rgba(99,102,241,0.12)' }}
              >
                {app.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div className="app-name">{app.name}</div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 3,
                  }}
                >
                  <span
                    className="badge badge-purple"
                    style={{ fontSize: '0.68rem' }}
                  >
                    {CATEGORY_ICONS[app.category]} {app.category}
                  </span>
                  {app.website_domain && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {app.website_domain}
                    </span>
                  )}
                </div>
              </div>
              <div className="app-row-meta">
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: app.is_blocked ? 'var(--danger)' : 'var(--success)',
                    fontWeight: 600,
                  }}
                >
                  {app.is_blocked ? '🔒 Blocked' : '✅ Allowed'}
                </span>
                <div
                  className="toggle-wrap"
                  onClick={() => saving !== app.id && toggle(app.id)}
                >
                  <div
                    className={`toggle ${app.is_blocked ? 'on' : ''}`}
                    style={
                      app.is_blocked
                        ? {
                            background:
                              'linear-gradient(135deg,#f87171,#ef4444)',
                          }
                        : {}
                    }
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        className="emergency-banner fade-up fade-up-4"
        style={{ marginTop: 24 }}
      >
        <div className="emergency-icon">🚨</div>
        <div className="emergency-text">
          <strong>Emergency Apps Are Always Accessible</strong>
          Phone Dialer and Emergency category apps are never blocked regardless
          of schedule.
        </div>
      </div>
    </div>
  );
}
