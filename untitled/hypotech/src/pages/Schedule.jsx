import { useState, useEffect } from 'react';
import { scheduleAPI } from '../services/api';

const SLEEP_TIMES = ['21:00:00', '22:00:00', '23:00:00'];
const WAKE_TIMES = ['05:00:00', '06:00:00', '07:00:00'];
const SLEEP_LABELS = ['9:00 PM', '10:00 PM', '11:00 PM'];
const WAKE_LABELS = ['5:00 AM', '6:00 AM', '7:00 AM'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Schedule() {
  const [sleepTime, setSleepTime] = useState('22:00:00');
  const [wakeTime, setWakeTime] = useState('06:00:00');
  const [activeDays, setActiveDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [windDown, setWindDown] = useState(true);
  const [windDownMins, setWindDownMins] = useState(30);
  const [bedtimeReminder, setBedtimeReminder] = useState(true);
  const [strictMode, setStrictMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    scheduleAPI
      .get()
      .then((data) => {
        const s = data.schedule;
        setSleepTime(s.sleep_time || '22:00:00');
        setWakeTime(s.wake_time || '06:00:00');
        setActiveDays(
          Array.isArray(s.active_days)
            ? s.active_days
            : s.active_days.split(',').map(Number),
        );
        setWindDown(!!s.wind_down_enabled);
        setWindDownMins(s.wind_down_mins || 30);
        setBedtimeReminder(!!s.bedtime_reminder);
        setStrictMode(!!s.strict_mode);
      })
      .catch((e) => console.error('Schedule load:', e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      await scheduleAPI.update({
        sleep_time: sleepTime,
        wake_time: wakeTime,
        active_days: activeDays,
        wind_down_enabled: windDown ? 1 : 0,
        wind_down_mins: windDownMins,
        bedtime_reminder: bedtimeReminder ? 1 : 0,
        strict_mode: strictMode ? 1 : 0,
        is_active: 1,
      });
      setMsg('✅ Schedule saved successfully!');
    } catch (e) {
      setMsg('❌ Failed to save: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (i) =>
    setActiveDays((d) =>
      d.includes(i) ? d.filter((x) => x !== i) : [...d, i],
    );

  const toHours = (sleep, wake) => {
    const sm = parseInt(sleep) * 60 + parseInt(sleep.split(':')[1]);
    const wm = parseInt(wake) * 60 + parseInt(wake.split(':')[1]);
    return sm > wm ? (1440 - sm + wm) / 60 : (wm - sm) / 60;
  };
  const fmt12 = (t) => {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };
  const totalHrs = toHours(sleepTime, wakeTime);

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
          ⏰
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Loading schedule...
        </div>
      </div>
    );

  return (
    <div>
      <div className="section-heading fade-up">Sleep Schedule</div>
      <div className="section-sub fade-up">
        Set your nightly sleep window. Apps will be restricted automatically.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card fade-up fade-up-1">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>🌙</span>
            <div>
              <div className="card-title" style={{ margin: 0 }}>
                Bedtime
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Restrictions activate
              </div>
            </div>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3rem',
              fontWeight: 800,
              color: 'var(--moon)',
              marginBottom: 20,
            }}
          >
            {fmt12(sleepTime)}
          </div>
          <div className="time-selector">
            {SLEEP_TIMES.map((t, i) => (
              <div
                key={t}
                className={`time-chip ${sleepTime === t ? 'active' : ''}`}
                onClick={() => setSleepTime(t)}
              >
                {SLEEP_LABELS[i]}
              </div>
            ))}
          </div>
        </div>

        <div className="card fade-up fade-up-2">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>☀️</span>
            <div>
              <div className="card-title" style={{ margin: 0 }}>
                Wake Time
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Restrictions lift
              </div>
            </div>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3rem',
              fontWeight: 800,
              color: 'var(--warning)',
              marginBottom: 20,
            }}
          >
            {fmt12(wakeTime)}
          </div>
          <div className="time-selector">
            {WAKE_TIMES.map((t, i) => (
              <div
                key={t}
                className={`time-chip ${wakeTime === t ? 'active' : ''}`}
                onClick={() => setWakeTime(t)}
              >
                {WAKE_LABELS[i]}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card fade-up fade-up-3" style={{ marginTop: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div>
            <div className="card-title">Sleep Window Summary</div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--success)',
              }}
            >
              {totalHrs.toFixed(1)} hours
            </div>
          </div>
          <span
            className={`badge ${totalHrs >= 8 ? 'badge-green' : totalHrs >= 7 ? 'badge-yellow' : 'badge-red'}`}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            {totalHrs >= 8
              ? '✅ Optimal'
              : totalHrs >= 7
                ? '⚠️ Sufficient'
                : '❌ Insufficient'}
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 16,
          }}
        >
          {[
            { label: 'Restriction Start', val: fmt12(sleepTime), icon: '🔒' },
            { label: 'Restriction End', val: fmt12(wakeTime), icon: '🔓' },
            {
              label: 'Protected Window',
              val: `${totalHrs.toFixed(1)}h`,
              icon: '🛡️',
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 16px',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>
                {item.icon}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginBottom: 4,
                }}
              >
                {item.label}
              </div>
              <div
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
              >
                {item.val}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card fade-up fade-up-4" style={{ marginTop: 24 }}>
        <div className="card-title" style={{ marginBottom: 16 }}>
          Active Days
        </div>
        <div className="week-days">
          {DAYS.map((d, i) => (
            <div
              key={i}
              className={`day-chip ${activeDays.includes(i) ? 'active' : ''}`}
              onClick={() => toggleDay(i)}
            >
              {d}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          {activeDays.length === 7
            ? 'Every day'
            : `${activeDays.length} days selected`}
        </div>
      </div>

      <div className="card fade-up fade-up-5" style={{ marginTop: 24 }}>
        <div className="card-title" style={{ marginBottom: 20 }}>
          Smart Options
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                🌅 Wind-Down Mode
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginTop: 3,
                }}
              >
                Gradually restrict apps {windDownMins} min before bedtime
              </div>
            </div>
            <div className="toggle-wrap" onClick={() => setWindDown((v) => !v)}>
              <div className={`toggle ${windDown ? 'on' : ''}`} />
            </div>
          </div>
          {windDown && (
            <div>
              <div className="form-label">
                Wind-Down Duration: {windDownMins} minutes
              </div>
              <input
                type="range"
                min={10}
                max={60}
                step={5}
                value={windDownMins}
                onChange={(e) => setWindDownMins(+e.target.value)}
              />
            </div>
          )}
          <div className="divider" style={{ margin: '4px 0' }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                🔔 Bedtime Reminder
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginTop: 3,
                }}
              >
                Notify 15 min before sleep mode
              </div>
            </div>
            <div
              className="toggle-wrap"
              onClick={() => setBedtimeReminder((v) => !v)}
            >
              <div className={`toggle ${bedtimeReminder ? 'on' : ''}`} />
            </div>
          </div>
          <div className="divider" style={{ margin: '4px 0' }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                🔐 Strict Mode
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginTop: 3,
                }}
              >
                Disables all bypass options
              </div>
            </div>
            <div
              className="toggle-wrap"
              onClick={() => setStrictMode((v) => !v)}
            >
              <div className={`toggle ${strictMode ? 'on' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: msg.startsWith('✅')
              ? 'rgba(52,211,153,0.1)'
              : 'rgba(248,113,113,0.1)',
            border: `1px solid ${msg.startsWith('✅') ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
            fontSize: '0.85rem',
            color: msg.startsWith('✅') ? 'var(--success)' : 'var(--danger)',
          }}
        >
          {msg}
        </div>
      )}

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? '⏳ Saving...' : '💾 Save Schedule'}
        </button>
      </div>
    </div>
  );
}
