// Header border on scroll
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile nav
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
});
nav.addEventListener('click', e => { if (e.target.closest('a') && nav.classList.contains('open')) toggle.click(); });

// Opening hours, London time. 0 = Sunday. [opens, closes] in minutes.
const HOURS = { 0: [555, 900], 1: null, 2: [480, 870], 3: [480, 900], 4: [480, 900], 5: [480, 900], 6: [555, 900] };
const fmt = m => { const h = Math.floor(m / 60), mm = m % 60; return (h % 12 || 12) + (mm ? ':' + String(mm).padStart(2, '0') : '') + (h >= 12 ? 'pm' : 'am'); };
const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
const get = t => parts.find(p => p.type === t).value;
const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
const now = Number(get('hour')) * 60 + Number(get('minute'));

const nextOpen = () => {
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (HOURS[d]) return (i === 1 ? 'tomorrow' : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]) + ' at ' + fmt(HOURS[d][0]);
  }
};
const today = HOURS[day];
let statusText, todayText, open = false;
if (!today) { statusText = 'Closed today, opens ' + nextOpen(); todayText = 'Closed today. We open ' + nextOpen() + '.'; }
else if (now < today[0]) { statusText = 'Opens today at ' + fmt(today[0]); todayText = 'Open ' + fmt(today[0]) + ' to ' + fmt(today[1]); }
else if (now < today[1]) { open = true; statusText = 'Open now, until ' + fmt(today[1]); todayText = 'Open now, until ' + fmt(today[1]); }
else { statusText = 'Closed now, opens ' + nextOpen(); todayText = 'Closed for today. We open ' + nextOpen() + '.'; }

const status = document.querySelector('[data-status]');
status.classList.toggle('is-open', open);
document.querySelector('[data-status-text]').textContent = statusText;
document.querySelector('[data-today]').textContent = todayText;
const row = document.querySelector(`.hours tr[data-day="${day}"]`);
if (row) row.classList.add('today');

// Menu: hover preview on desktop, small thumbnails on mobile
const preview = document.querySelector('[data-preview]');
const items = document.querySelectorAll('.menu li[data-img]');
const src = n => `assets/img/menu/${n}.jpg`;
items.forEach(li => {
  const t = new Image();
  t.className = 'thumb'; t.alt = ''; t.loading = 'lazy'; t.width = 52; t.height = 52; t.src = src(li.dataset.img);
  li.prepend(t);
});
let current = '', timer;
const show = li => {
  const name = li.dataset.img;
  items.forEach(i => i.classList.toggle('active', i === li));
  if (name === current) return;
  current = name;
  clearTimeout(timer);
  preview.classList.add('swap');
  timer = setTimeout(() => {
    preview.src = src(name);
    preview.onload = () => preview.classList.remove('swap');
  }, 180);
};
items.forEach(li => li.addEventListener('mouseenter', () => show(li)));

document.querySelector('[data-year]').textContent = new Date().getFullYear();
