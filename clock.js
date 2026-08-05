// Multi‑timezone digital clock (clock.js)
const STORAGE_KEY = 'multi-clock:v1';
const defaultZones = [
  { id: 'local', label: 'Local' },
  { id: 'UTC', label: 'UTC' },
  { id: 'America/New_York', label: 'New York (America/New_York)' },
  { id: 'Europe/London', label: 'London (Europe/London)' },
  { id: 'Asia/Tokyo', label: 'Tokyo (Asia/Tokyo)' }
];

const zonesEl = document.getElementById('zones');
const addBtn = document.getElementById('add-tz');
const tzInput = document.getElementById('tz-input');
const showSecondsEl = document.getElementById('show-seconds');
const hour12El = document.getElementById('hour-12');
const resetBtn = document.getElementById('reset-defaults');

let state = {
  zones: [], // { id: iana or 'local', label }
  showSeconds: true,
  hour12: false
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = Object.assign(state, parsed);
    } else {
      state.zones = defaultZones.slice();
    }
  } catch (e) {
    console.error('Failed to load state', e);
    state.zones = defaultZones.slice();
  }
  showSecondsEl.checked = !!state.showSeconds;
  hour12El.checked = !!state.hour12;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isValidTimeZone(tz) {
  if (!tz) return false;
  if (tz.toLowerCase() === 'local') return true;
  try {
    // This will throw for invalid timeZone values in some browsers
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch (e) {
    return false;
  }
}

function formatTimeForZone(tz) {
  const opts = {
    hour: 'numeric',
    minute: 'numeric',
    second: state.showSeconds ? 'numeric' : undefined,
    hour12: !!state.hour12,
    timeZoneName: 'short'
  };
  const zone = tz === 'local' ? undefined : tz;
  return new Intl.DateTimeFormat(undefined, Object.assign({}, opts, zone ? { timeZone: zone } : {})).format(new Date());
}

function getOffsetForZone(tz) {
  try {
    const now = new Date();
    if (tz === 'local') {
      const offsetMin = -now.getTimezoneOffset();
      return offsetMin;
    }
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit' });
    const parts = fmt.formatToParts(now);
    // We can estimate offset by comparing UTC hours to local in target zone
    const utc = new Date(now.toUTCString().replace(' GMT', ''));
    const target = new Date(fmt.format(now));
    // fallback: not perfect. We'll instead compute offsetMinutes using getTimezoneOffset difference hack
    // Create two Date objects: one with locale string for tz then parse — unreliable. So we compute offset using
    // getTimezoneOffset for local and convert to minutes based on Intl formatting of hours only — but that's fragile.
    // To keep it simple, return an empty string and rely on short timeZoneName in formatted time.
    return '';
  } catch (e) {
    return '';
  }
}

function render() {
  zonesEl.innerHTML = '';
  state.zones.forEach((z, idx) => {
    const li = document.createElement('li');
    li.className = 'zone';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const tzLabel = document.createElement('div');
    tzLabel.className = 'tz';
    tzLabel.textContent = z.label || z.id;
    const removeBtn = document.createElement('button');
    removeBtn.className = 'icon-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      state.zones.splice(idx,1);
      save();
      render();
    });

    meta.append(tzLabel, removeBtn);

    const timeEl = document.createElement('div');
    timeEl.className = 'time';
    timeEl.dataset.tz = z.id;
    timeEl.textContent = formatTimeForZone(z.id);

    const offsetEl = document.createElement('div');
    offsetEl.className = 'offset';
    offsetEl.textContent = getOffsetForZone(z.id);

    li.append(meta, timeEl, offsetEl);
    zonesEl.appendChild(li);
  });
}

function tick() {
  document.querySelectorAll('.time').forEach(el => {
    const tz = el.dataset.tz;
    el.textContent = formatTimeForZone(tz);
  });
}

addBtn.addEventListener('click', () => {
  const val = tzInput.value.trim();
  if (!val) return;
  // Support special keyword 'local'
  const id = val === 'local' ? 'local' : val;
  if (!isValidTimeZone(id)) {
    alert('Invalid IANA time zone: ' + val);
    return;
  }
  // Avoid duplicates
  if (state.zones.some(z => z.id === id)) {
    alert('Time zone already added');
    tzInput.value = '';
    return;
  }
  state.zones.push({ id, label: id === 'local' ? 'Local' : id });
  tzInput.value = '';
  save();
  render();
});

tzInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addBtn.click();
});

showSecondsEl.addEventListener('change', () => {
  state.showSeconds = showSecondsEl.checked;
  save();
  render();
});

hour12El.addEventListener('change', () => {
  state.hour12 = hour12El.checked;
  save();
  render();
});

resetBtn.addEventListener('click', () => {
  if (!confirm('Reset zones and options to defaults?')) return;
  state.zones = defaultZones.slice();
  state.showSeconds = true;
  state.hour12 = false;
  showSecondsEl.checked = true;
  hour12El.checked = false;
  save();
  render();
});

// initialize
load();
render();
setInterval(tick, 1000);
