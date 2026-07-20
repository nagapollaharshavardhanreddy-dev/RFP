import { useState, useEffect } from 'react';
import { settingsAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    notif_enabled: 1,
    sound_enabled: 1,
    auto_report: 1,
    pin_protection: 1,
    cloud_sync: 0,
    dark_mode: 1,
    sleep_target_hours: 8,
    wake_flexibility_min: 15,
  });
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    age_group: 'Adult',
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([settingsAPI.get(), authAPI.getProfile()])
      .then(([sRes, pRes]) => {
        setSettings(sRes.settings);
        setProfile(pRes.user);
      })
      .catch((e) => console.error('Settings load:', e.message))
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    setMsg('');
    try {
      await settingsAPI.update(settings);
      setMsg('✅ Settings saved!');
    } catch (e) {
      setMsg('❌ ' + e.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    setMsg('');
    try {
      await authAPI.updateProfile({
        name: profile.name,
        phone: profile.phone,
        age_group: profile.age_group,
      });
      setMsg('✅ Profile updated!');
    } catch (e) {
      setMsg('❌ ' + e.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const deleteData = async () => {
    if (!confirm('Delete all your sleep data? This cannot be undone.')) return;
    try {
      await settingsAPI.deleteData();
      setMsg('✅ Sleep data deleted.');
    } catch (e) {
      setMsg('❌ ' + e.message);
    }
  };

  const set = (key, val) => setSettings((s) => ({ ...s, [key]: val }));
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'HT';

  const SettingRow = ({ icon, title, desc, valKey, danger }) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <div>
          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: danger ? 'var(--danger)' : 'var(--text-primary)',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: 2,
            }}
          >
            {desc}
          </div>
        </div>
      </div>
      <div
        className="toggle-wrap"
        onClick={() => set(valKey, settings[valKey] ? 0 : 1)}
      >
        <div
          className={`toggle ${settings[valKey] ? 'on' : ''}`}
          style={
            danger && settings[valKey]
              ? { background: 'linear-gradient(135deg,#f87171,#ef4444)' }
              : {}
          }
        />
      </div>
    </div>
  );

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
          ⚙️
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Loading settings...
        </div>
      </div>
    );

  return (
    <div>
      <div className="section-heading fade-up">Settings</div>
      <div className="section-sub fade-up">
        Manage your HypoTech preferences and account
      </div>

      {msg && (
        <div
          style={{
            marginBottom: 20,
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

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Profile */}
        <div className="card fade-up fade-up-1">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg,var(--aurora-1),var(--aurora-2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#fff',
                border: '3px solid rgba(99,102,241,0.4)',
              }}
            >
              {initials}
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                }}
              >
                {profile.name}
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginTop: 2,
                }}
              >
                {profile.email}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div className="form-label">Full Name</div>
              <input
                className="form-input"
                value={profile.name || ''}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div>
              <div className="form-label">Phone Number</div>
              <input
                className="form-input"
                value={profile.phone || ''}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </div>
            <div>
              <div className="form-label">Age Group</div>
              <select
                className="form-select"
                value={profile.age_group || 'Adult'}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, age_group: e.target.value }))
                }
              >
                {['Teen', 'YoungAdult', 'Adult', 'Senior'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-primary"
              onClick={saveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? '⏳ Saving...' : '💾 Update Profile'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card fade-up fade-up-2">
            <div className="card-title" style={{ marginBottom: 4 }}>
              Notifications
            </div>
            <SettingRow
              icon="🔔"
              title="Push Notifications"
              desc="Bedtime reminders & block alerts"
              valKey="notif_enabled"
            />
            <SettingRow
              icon="🔊"
              title="Sound Alerts"
              desc="Audio cue when sleep mode activates"
              valKey="sound_enabled"
            />
            <SettingRow
              icon="📧"
              title="Weekly Email Report"
              desc="Receive Sunday sleep summary"
              valKey="auto_report"
            />
          </div>

          <div className="card fade-up fade-up-3">
            <div className="card-title" style={{ marginBottom: 4 }}>
              Security & Sync
            </div>
            <SettingRow
              icon="🔐"
              title="PIN Protection"
              desc="Require PIN to change settings"
              valKey="pin_protection"
            />
            <SettingRow
              icon="☁️"
              title="Cloud Sync"
              desc="Sync settings across devices"
              valKey="cloud_sync"
            />
          </div>

          <button
            className="btn btn-primary fade-up"
            onClick={saveSettings}
            disabled={savingSettings}
          >
            {savingSettings ? '⏳ Saving...' : '💾 Save All Settings'}
          </button>
        </div>
      </div>

      <div
        className="card fade-up"
        style={{ marginTop: 24, borderColor: 'rgba(248,113,113,0.2)' }}
      >
        <div
          className="card-title"
          style={{ marginBottom: 16, color: 'var(--danger)' }}
        >
          ⚠️ Danger Zone
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-danger" onClick={deleteData}>
            🗑️ Delete Sleep Data
          </button>
          <button className="btn btn-danger" onClick={logout}>
            🚪 Logout
          </button>
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          These actions may be irreversible.
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: '16px 20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            HypoTech Sleep Guardian
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: 2,
            }}
          >
            Version 1.0.0 · React + Node.js + MySQL + Chrome Extension
          </div>
        </div>
        <span className="badge badge-green">✅ Fully Integrated</span>
      </div>
    </div>
  );
}
