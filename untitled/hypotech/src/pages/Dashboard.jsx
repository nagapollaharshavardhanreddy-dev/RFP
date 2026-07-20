import { useState, useEffect } from 'react';
import SleepArcChart from '../components/SleepArcChart';
import { reportsAPI, scheduleAPI } from '../services/api';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sleepMode, setSleepMode] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, schedRes, weekRes] = await Promise.all([
          reportsAPI.dashboard(),
          scheduleAPI.get(),
          reportsAPI.weekly(),
        ]);
        setDashboard(dashRes);
        setSchedule(schedRes.schedule);
        setSleepMode(schedRes.schedule?.is_active === 1);
        setWeekly(weekRes);
      } catch (err) {
        console.error('Dashboard load error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleSleepMode = async () => {
    const newVal = !sleepMode;
    setSleepMode(newVal);
    try {
      await scheduleAPI.update({ ...schedule, is_active: newVal ? 1 : 0 });
    } catch (e) {
      console.error(e);
    }
  };

  const fmt12 = (t) => {
    if (!t) return '—';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const weeklyData = weekly?.daily || [];
  const maxHrs = weeklyData.length
    ? Math.max(...weeklyData.map((d) => parseFloat(d.total_hours || 0)))
    : 8;

  const STAT_CARDS = [
    {
      label: 'Sleep Score',
      value: weekly?.summary?.avgQuality || '—',
      unit: '/100',
      icon: '⭐',
      color: 'var(--aurora-1)',
    },
    {
      label: 'Avg Sleep',
      value: weekly?.summary?.avgSleep || '—',
      unit: 'hrs',
      icon: '🛏️',
      color: 'var(--success)',
    },
    {
      label: 'Apps Blocked',
      value: weekly?.summary?.totalBlocks || '—',
      unit: 'total',
      icon: '🔒',
      color: 'var(--warning)',
    },
    {
      label: 'Streak',
      value: dashboard?.streak || '0',
      unit: 'days',
      icon: '🔥',
      color: 'var(--danger)',
    },
  ];

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
          🌙
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Loading your sleep data...
        </div>
      </div>
    );

  return (
    <div>
      {/* Hero Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div
          className="card glow fade-up"
          style={{ display: 'flex', alignItems: 'center', gap: 32 }}
        >
          <SleepArcChart
            sleepTime={schedule?.sleep_time}
            wakeTime={schedule?.wake_time}
          />
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Tonight's Schedule
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--moon)',
                lineHeight: 1,
              }}
            >
              {fmt12(schedule?.sleep_time)} → {fmt12(schedule?.wake_time)}
            </div>
            <div
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                marginTop: 6,
                marginBottom: 20,
              }}
            >
              Protected sleep window
            </div>
            <div className="toggle-wrap" onClick={toggleSleepMode}>
              <div className={`toggle ${sleepMode ? 'on' : ''}`} />
              <span
                className="toggle-label"
                style={{
                  color: sleepMode ? 'var(--success)' : 'var(--text-muted)',
                }}
              >
                {sleepMode ? '🟢 Sleep Guard Active' : '⚫ Sleep Guard Off'}
              </span>
            </div>
          </div>
        </div>

        <div
          className="card fade-up fade-up-1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="moon-phase-display float">🌕</div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--moon)',
              }}
            >
              Sleep Guardian
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                marginTop: 4,
              }}
            >
              {sleepMode ? 'Protection is active' : 'Protection is disabled'}
            </div>
          </div>
          <div
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Sleep Quality Index
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--success)',
                }}
              >
                {weekly?.summary?.avgQuality || 0}%
              </span>
            </div>
            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill fill-purple"
                style={{ width: `${weekly?.summary?.avgQuality || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 fade-up fade-up-2" style={{ marginBottom: 24 }}>
        {STAT_CARDS.map((s, i) => (
          <div className="card" key={i}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 12,
              }}
            >
              <div className="card-title">{s.label}</div>
              <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <div className="card-value" style={{ color: s.color }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {s.unit}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2 fade-up fade-up-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>
            Weekly Sleep Hours
          </div>
          {weeklyData.length === 0 ? (
            <div
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                textAlign: 'center',
                padding: '40px 0',
              }}
            >
              No sleep data yet. Start logging your sleep! 🌙
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 10,
                height: 130,
              }}
            >
              {weeklyData.map((d, i) => {
                const hrs = parseFloat(d.total_hours || 0);
                const pct = maxHrs > 0 ? (hrs / maxHrs) * 100 : 0;
                const color =
                  hrs >= 7
                    ? 'var(--success)'
                    : hrs >= 6
                      ? 'var(--warning)'
                      : 'var(--danger)';
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {hrs}h
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: `${pct}%`,
                        background: `linear-gradient(180deg,${color}cc,${color}44)`,
                        borderRadius: '5px 5px 0 0',
                        minHeight: 4,
                      }}
                    />
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                      }}
                    >
                      {new Date(d.log_date).toLocaleDateString('en', {
                        weekday: 'short',
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div className="card-title">Blocked Last Night</div>
            <span className="badge badge-red">🔴 Live</span>
          </div>
          {(dashboard?.lastNightBlocks || []).length === 0 ? (
            <div
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                textAlign: 'center',
                padding: '40px 0',
              }}
            >
              No blocks recorded last night 😴
            </div>
          ) : (
            (dashboard?.lastNightBlocks || []).map((b, i) => (
              <div className="app-row" key={i}>
                <div
                  className="app-icon-wrap"
                  style={{ background: 'rgba(99,102,241,0.15)' }}
                >
                  {b.icon}
                </div>
                <div>
                  <div className="app-name">{b.name}</div>
                  <div className="app-category">
                    Last at {new Date(b.last_blocked).toLocaleTimeString()}
                  </div>
                </div>
                <div className="app-row-meta">
                  <span className="badge badge-red">{b.attempts}× tried</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="emergency-banner fade-up fade-up-4">
        <div className="emergency-icon">🚨</div>
        <div className="emergency-text">
          <strong>Emergency Override Available</strong>
          Use the HypoTech Chrome Extension to temporarily disable restrictions
          for 15 minutes in emergencies.
        </div>
      </div>
    </div>
  );
}
