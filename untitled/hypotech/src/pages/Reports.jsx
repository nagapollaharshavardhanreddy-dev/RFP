import { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsAPI
      .weekly()
      .then((res) => setData(res))
      .catch((e) => console.error('Reports:', e.message))
      .finally(() => setLoading(false));
  }, []);

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
          📊
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Loading reports...
        </div>
      </div>
    );

  const weekly = data?.daily || [];
  const stats = data?.summary || {};
  const appBlocks = data?.appBlockStats || [];
  const maxHrs = weekly.length
    ? Math.max(...weekly.map((d) => parseFloat(d.total_hours || 0)), 1)
    : 8;
  const maxBlks = weekly.length
    ? Math.max(...weekly.map((d) => d.apps_blocked || 0), 1)
    : 1;
  const maxAppBlk = appBlocks.length
    ? Math.max(...appBlocks.map((a) => a.total_blocks), 1)
    : 1;

  const emptyState = (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 0',
        color: 'var(--text-muted)',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: 12 }}>😴</div>
      <div style={{ fontSize: '0.88rem' }}>
        No sleep data yet. Your reports will appear here after you start logging
        sleep.
      </div>
    </div>
  );

  return (
    <div>
      <div className="section-heading fade-up">Sleep Reports</div>
      <div className="section-sub fade-up">
        Your sleep analytics for the past 7 days
      </div>

      <div className="grid-4 fade-up fade-up-1" style={{ marginBottom: 24 }}>
        {[
          {
            label: 'Avg Sleep',
            val: `${stats.avgSleep || 0}h`,
            icon: '🛏️',
            color: 'var(--aurora-1)',
          },
          {
            label: 'Avg Quality',
            val: `${stats.avgQuality || 0}`,
            icon: '⭐',
            color: 'var(--success)',
          },
          {
            label: 'Total Blocks',
            val: `${stats.totalBlocks || 0}`,
            icon: '🔒',
            color: 'var(--warning)',
          },
          {
            label: 'Nights Tracked',
            val: `${stats.nightsTracked || 0}`,
            icon: '📅',
            color: 'var(--info)',
          },
        ].map((s, i) => (
          <div className="card" key={i}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <div className="card-title">{s.label}</div>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
            </div>
            <div className="card-value" style={{ color: s.color }}>
              {s.val}
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2 fade-up fade-up-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>
            Daily Sleep Hours
          </div>
          {weekly.length === 0 ? (
            emptyState
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 10,
                height: 130,
              }}
            >
              {weekly.map((d, i) => {
                const hrs = parseFloat(d.total_hours || 0);
                const pct = (hrs / maxHrs) * 100;
                const color =
                  hrs >= 7 ? '#34d399' : hrs >= 6 ? '#fbbf24' : '#f87171';
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
          <div className="card-title" style={{ marginBottom: 20 }}>
            App Blocks Per Night
          </div>
          {weekly.length === 0 ? (
            emptyState
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 10,
                height: 130,
              }}
            >
              {weekly.map((d, i) => {
                const blks = d.apps_blocked || 0;
                const pct = (blks / maxBlks) * 100;
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
                      {blks}
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: `${pct}%`,
                        background:
                          'linear-gradient(180deg,#6366f1cc,#6366f144)',
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
      </div>

      <div className="grid-2 fade-up fade-up-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>
            Most Blocked This Week
          </div>
          {appBlocks.length === 0
            ? emptyState
            : appBlocks.map((a, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <span style={{ fontSize: '1rem' }}>{a.icon}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {a.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {a.total_blocks} blocks
                    </span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className="progress-bar-fill fill-purple"
                      style={{
                        width: `${(a.total_blocks / maxAppBlk) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>
            Sleep Quality Trend
          </div>
          {weekly.length === 0
            ? emptyState
            : weekly.map((d, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      {new Date(d.log_date).toLocaleDateString('en', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color:
                          d.quality_score >= 80
                            ? 'var(--success)'
                            : d.quality_score >= 70
                              ? 'var(--warning)'
                              : 'var(--danger)',
                      }}
                    >
                      {d.quality_score || 0}/100
                    </span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${d.quality_score || 0}%`,
                        background:
                          (d.quality_score || 0) >= 80
                            ? 'linear-gradient(90deg,#10b981,#34d399)'
                            : (d.quality_score || 0) >= 70
                              ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                              : 'linear-gradient(90deg,#ef4444,#f87171)',
                      }}
                    />
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
