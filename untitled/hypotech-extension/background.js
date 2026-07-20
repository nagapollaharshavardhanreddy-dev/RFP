// background.js — HypoTech Sleep Guardian
// Runs silently in background, checks every tab navigation

const API_BASE = 'http://localhost:5000/api';

// ── Default blocked websites ──────────────────────────────
const DEFAULT_BLOCKED = [
  'instagram.com',
  'www.instagram.com',
  'youtube.com',
  'www.youtube.com',
  'twitter.com',
  'www.twitter.com',
  'x.com',
  'tiktok.com',
  'www.tiktok.com',
  'facebook.com',
  'www.facebook.com',
  'snapchat.com',
  'www.snapchat.com',
  'reddit.com',
  'www.reddit.com',
  'netflix.com',
  'www.netflix.com',
  'primevideo.com',
  'www.primevideo.com',
  'twitch.tv',
  'www.twitch.tv',
];

// ── Helpers ───────────────────────────────────────────────
function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['hypotech_token'], (r) =>
      resolve(r.hypotech_token || null),
    );
  });
}

function getStoredSchedule() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['schedule', 'blockedSites', 'guardActive'], (r) =>
      resolve(r),
    );
  });
}

function extractHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function timeToMinutes(timeStr) {
  // Accepts "HH:MM:SS" or "HH:MM"
  const parts = timeStr.split(':').map(Number);
  return parts[0] * 60 + parts[1];
}

function isCurrentlyInSleepWindow(schedule) {
  if (!schedule || !schedule.is_active) return false;

  const now = new Date();
  const dayIndex = now.getDay(); // 0=Sun ... 6=Sat
  const activeDays = Array.isArray(schedule.active_days)
    ? schedule.active_days
    : (schedule.active_days || '0,1,2,3,4,5,6').split(',').map(Number);

  if (!activeDays.includes(dayIndex)) return false;

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const sleepMins = timeToMinutes(schedule.sleep_time || '22:00:00');
  const wakeMins = timeToMinutes(schedule.wake_time || '06:00:00');

  // Sleep window crosses midnight (e.g. 22:00 → 06:00)
  if (sleepMins > wakeMins) {
    return nowMins >= sleepMins || nowMins < wakeMins;
  }
  // Same-day window (e.g. 01:00 → 07:00)
  return nowMins >= sleepMins && nowMins < wakeMins;
}

// ── Fetch schedule from backend ───────────────────────────
async function syncScheduleFromAPI() {
  const token = await getToken();
  if (!token) return;

  try {
    const [schedRes, appsRes] = await Promise.all([
      fetch(`${API_BASE}/schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/apps`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!schedRes.ok || !appsRes.ok) return;

    const schedData = await schedRes.json();
    const appsData = await appsRes.json();

    const blockedSites = (appsData.apps || [])
      .filter((a) => a.is_blocked)
      .map((a) => a.website_domain)
      .filter(Boolean);

    // Merge with defaults if no custom domains set
    const finalBlocked =
      blockedSites.length > 0
        ? [...new Set([...DEFAULT_BLOCKED, ...blockedSites])]
        : DEFAULT_BLOCKED;

    await chrome.storage.local.set({
      schedule: schedData.schedule,
      blockedSites: finalBlocked,
      lastSync: Date.now(),
    });

    console.log('🌙 HypoTech: Schedule synced from API');
  } catch (err) {
    console.warn(
      'HypoTech: Could not sync from API, using stored data.',
      err.message,
    );
  }
}

// ── Core: Check if URL should be blocked ──────────────────
async function shouldBlock(url) {
  const { schedule, blockedSites, guardActive } = await getStoredSchedule();

  // If user manually disabled guard
  if (guardActive === false) return false;

  // Check time window
  if (!isCurrentlyInSleepWindow(schedule)) return false;

  // Check if site is in blocked list
  const host = extractHostname(url);
  const blocked = blockedSites || DEFAULT_BLOCKED;
  return blocked.some((b) => host === b || host.endsWith('.' + b));
}

// ── Intercept Navigation ──────────────────────────────────
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // only main frame
  if (!details.url.startsWith('http')) return;
  if (details.url.includes(chrome.runtime.id)) return; // don't block our own pages

  const block = await shouldBlock(details.url);
  if (block) {
    const blockedUrl =
      chrome.runtime.getURL('blocked.html') +
      '?site=' +
      encodeURIComponent(extractHostname(details.url)) +
      '&url=' +
      encodeURIComponent(details.url);

    chrome.tabs.update(details.tabId, { url: blockedUrl });

    // Log block event to API
    logBlockToAPI(details.url);
  }
});

// ── Also intercept tab updates (catches typed URLs) ───────
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'loading') return;
  if (!tab.url || !tab.url.startsWith('http')) return;
  if (tab.url.includes(chrome.runtime.id)) return;

  const block = await shouldBlock(tab.url);
  if (block) {
    const blockedUrl =
      chrome.runtime.getURL('blocked.html') +
      '?site=' +
      encodeURIComponent(extractHostname(tab.url)) +
      '&url=' +
      encodeURIComponent(tab.url);

    chrome.tabs.update(tabId, { url: blockedUrl });
    logBlockToAPI(tab.url);
  }
});

// ── Log block event to backend ────────────────────────────
async function logBlockToAPI(url) {
  const token = await getToken();
  if (!token) return;
  try {
    await fetch(`${API_BASE}/apps/block-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ website: extractHostname(url) }),
    });
  } catch (_) {}
}

// ── Alarm: sync schedule every 5 minutes ─────────────────
chrome.alarms.create('syncSchedule', { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncSchedule') syncScheduleFromAPI();
});

// ── Bedtime Notification ──────────────────────────────────
async function checkBedtimeNotification() {
  const { schedule } = await getStoredSchedule();
  if (!schedule || !schedule.bedtime_reminder) return;

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const sleepMins = timeToMinutes(schedule.sleep_time || '22:00:00');
  const warnMins = sleepMins - 15;

  if (nowMins === warnMins) {
    chrome.notifications.create('bedtime-warning', {
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🌙 HypoTech: Bedtime in 15 minutes!',
      message: `Sleep mode activates at ${schedule.sleep_time?.slice(0, 5)}. Finish up and prepare for sleep.`,
    });
  }
}

chrome.alarms.create('bedtimeCheck', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'bedtimeCheck') checkBedtimeNotification();
});

// ── Message listener (from popup) ────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_STATUS') {
    getStoredSchedule().then(({ schedule, guardActive }) => {
      sendResponse({
        isSleepTime: isCurrentlyInSleepWindow(schedule),
        schedule,
        guardActive: guardActive !== false,
      });
    });
    return true; // async
  }

  if (msg.type === 'SET_TOKEN') {
    chrome.storage.local.set({ hypotech_token: msg.token }, () => {
      syncScheduleFromAPI().then(() => sendResponse({ success: true }));
    });
    return true;
  }

  if (msg.type === 'TOGGLE_GUARD') {
    chrome.storage.local.set({ guardActive: msg.value }, () =>
      sendResponse({ success: true }),
    );
    return true;
  }

  if (msg.type === 'FORCE_SYNC') {
    syncScheduleFromAPI().then(() => sendResponse({ success: true }));
    return true;
  }
});

// ── On install / startup ──────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    guardActive: true,
    blockedSites: DEFAULT_BLOCKED,
  });
  syncScheduleFromAPI();
  console.log('🌙 HypoTech Sleep Guardian installed!');
});

chrome.runtime.onStartup.addListener(() => {
  syncScheduleFromAPI();
});
