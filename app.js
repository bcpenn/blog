/* ============================================================
   RETRO MAC OS 9 — app.js
   ============================================================ */

// ============================================================
// BLOG POSTS — add / edit your posts here
// ============================================================

const POSTS = [
  {
    id: 'post-welcome',
    title: 'Welcome to My Corner of the Internet',
    date: 'February 19, 2026',
    body: `
      <p>Hello and welcome! I've been wanting a personal website for a while,
      and I finally decided to build one — with a twist.</p>

      <p>Why settle for a boring portfolio template when you can have a fully
      interactive retro Mac desktop? That's my philosophy anyway.</p>

      <h3>What You'll Find Here</h3>
      <p>These notes are where I'll write about things I'm thinking about,
      working on, or just find interesting. No algorithm, no engagement
      metrics — just writing.</p>

      <p>Click around, open some windows, and enjoy the vibe.</p>
    `
  },
  {
    id: 'post-design',
    title: 'The Design Philosophy Behind This Site',
    date: 'February 15, 2026',
    body: `
      <p>I've always been fascinated by old-school Mac UI design. There was
      something deeply thoughtful about it — constraints that forced clarity,
      a consistency that made everything feel cohesive.</p>

      <p>This site is built with plain HTML, CSS, and JavaScript. No
      frameworks, no dependencies. Just the web, as it was meant to be.</p>

      <h3>Why Retro?</h3>
      <p>Because nostalgia is powerful, but also because the Mac OS 8/9 design
      language is genuinely timeless. The beveled buttons, the striped title
      bars, the teal desktop — it all holds up.</p>

      <h3>How It Works</h3>
      <ul>
        <li>Double-click any icon to open a window</li>
        <li>Drag windows by their title bars</li>
        <li>Resize windows from the bottom-right corner</li>
        <li>Close with the button in the top-left</li>
      </ul>
    `
  },
  {
    id: 'post-reading',
    title: 'Things I\'ve Been Reading',
    date: 'February 10, 2026',
    body: `
      <p>A quick roundup of things I've been reading lately, with brief
      thoughts on each.</p>

      <h3>Books</h3>
      <p>Currently working through a mix of technical reading and fiction.
      The variety helps keep my brain from getting too siloed.</p>

      <h3>Articles</h3>
      <p>The web still produces great long-form writing if you know where to
      look. Personal blogs, Substack newsletters, and a few good aggregators
      keep me fed.</p>

      <p>More specific recommendations to come in future posts.</p>
    `
  }
];

// ============================================================
// YOUR EMAIL — update this before deploying
// ============================================================

const MY_EMAIL = 'hello@brandonpenn.com';

// ============================================================
// STARTUP SEQUENCE
// ============================================================

(function runStartup() {
  const fill = document.querySelector('.startup-bar-fill');
  const startup = document.getElementById('startup');
  let progress = 0;

  const interval = setInterval(() => {
    // Random-ish increments like real Mac OS startup
    progress += Math.random() * 12 + 3;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      // Short pause at 100%, then fade out
      setTimeout(() => {
        startup.classList.add('fade-out');
        setTimeout(() => startup.remove(), 650);
      }, 300);
    }
    fill.style.width = progress + '%';
  }, 120);
})();

// ============================================================
// CLOCK
// ============================================================

function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const m = String(now.getMinutes()).padStart(2, '0');
  const day = now.toLocaleDateString('en-US', { weekday: 'short' });
  document.getElementById('clock').textContent = `${day} ${h}:${m} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// ============================================================
// WINDOW MANAGER
// ============================================================

let zTop = 100;

function bringToFront(win) {
  document.querySelectorAll('.window').forEach(w => w.classList.add('inactive'));
  win.classList.remove('inactive');
  win.style.zIndex = ++zTop;
}

function openWindow(name) {
  const win = document.getElementById('window-' + name);
  if (!win) return;

  if (win.style.display === 'none') {
    win.style.display = 'flex';

    // Cascade: offset from other visible windows
    const others = [...document.querySelectorAll('.window')]
      .filter(w => w !== win && w.style.display !== 'none');
    if (others.length > 0) {
      const base = others[others.length - 1];
      const newTop  = Math.min(parseInt(base.style.top  || 80) + 24, window.innerHeight - 200);
      const newLeft = Math.min(parseInt(base.style.left || 80) + 24, window.innerWidth  - 300);
      win.style.top  = newTop  + 'px';
      win.style.left = newLeft + 'px';
    }

    // Init notes sidebar on first open
    if (name === 'notes' && !win.dataset.initialized) {
      initNotes();
      win.dataset.initialized = 'true';
    }
  }

  bringToFront(win);
}

function closeWindow(name) {
  const win = document.getElementById('window-' + name);
  if (win) win.style.display = 'none';
}

// Zoom = toggle maximise
const zoomSavedState = {};

function zoomWindow(name) {
  const win = document.getElementById('window-' + name);
  if (!win) return;

  if (zoomSavedState[name]) {
    // Restore
    Object.assign(win.style, zoomSavedState[name]);
    delete zoomSavedState[name];
  } else {
    // Save & maximise
    zoomSavedState[name] = {
      top:    win.style.top,
      left:   win.style.left,
      width:  win.style.width,
      height: win.style.height
    };
    win.style.top    = '4px';
    win.style.left   = '4px';
    win.style.width  = (window.innerWidth  - 12) + 'px';
    win.style.height = (window.innerHeight - 30) + 'px';
  }
  bringToFront(win);
}

// ── Wire up window click → bring to front ──
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.window').forEach(win => {
    win.addEventListener('mousedown', () => bringToFront(win));
  });
});

// ============================================================
// WINDOW DRAGGING
// ============================================================

let drag = null;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.titlebar').forEach(bar => {
    bar.addEventListener('mousedown', e => {
      if (e.target.closest('.btn-close, .btn-zoom')) return;
      const win = document.getElementById(bar.dataset.win);
      if (!win) return;
      bringToFront(win);
      drag = {
        win,
        ox: e.clientX - win.offsetLeft,
        oy: e.clientY - win.offsetTop
      };
      e.preventDefault();
    });
  });
});

document.addEventListener('mousemove', e => {
  if (!drag) return;
  const { win, ox, oy } = drag;
  const menuH = 22;
  let x = e.clientX - ox;
  let y = e.clientY - oy;
  // Clamp so window can't escape viewport
  x = Math.max(-(win.offsetWidth - 80), Math.min(window.innerWidth - 80, x));
  y = Math.max(menuH, Math.min(window.innerHeight - 30, y));
  win.style.left = x + 'px';
  win.style.top  = y + 'px';
});

document.addEventListener('mouseup', () => { drag = null; });

// ============================================================
// WINDOW RESIZE
// ============================================================

let resz = null;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.win-resize').forEach(handle => {
    handle.addEventListener('mousedown', e => {
      const win = document.getElementById(handle.dataset.win);
      if (!win) return;
      resz = {
        win,
        sx: e.clientX,
        sy: e.clientY,
        sw: win.offsetWidth,
        sh: win.offsetHeight
      };
      bringToFront(win);
      e.preventDefault();
      e.stopPropagation();
    });
  });
});

document.addEventListener('mousemove', e => {
  if (!resz) return;
  const { win, sx, sy, sw, sh } = resz;
  win.style.width  = Math.max(240, sw + (e.clientX - sx)) + 'px';
  win.style.height = Math.max(160, sh + (e.clientY - sy)) + 'px';
});

document.addEventListener('mouseup', () => { resz = null; });

// ============================================================
// DESKTOP ICONS — selection & double-click
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const icons = document.querySelectorAll('.desktop-icon');

  icons.forEach(icon => {
    let clickTimer = null;

    icon.addEventListener('click', e => {
      e.stopPropagation();

      if (clickTimer !== null) {
        // Second click within 450ms = double-click
        clearTimeout(clickTimer);
        clickTimer = null;
        icons.forEach(i => i.classList.remove('selected'));
        openWindow(icon.dataset.window);
      } else {
        // First click = select
        icons.forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
        clickTimer = setTimeout(() => { clickTimer = null; }, 450);
      }
    });
  });

  // Click on desktop background deselects everything
  document.getElementById('desktop').addEventListener('click', e => {
    if (e.target === document.getElementById('desktop')) {
      icons.forEach(i => i.classList.remove('selected'));
    }
  });
});

// ============================================================
// CLOSE / ZOOM BUTTON WIRING
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      closeWindow(btn.dataset.close);
    });
  });

  document.querySelectorAll('[data-zoom]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      zoomWindow(btn.dataset.zoom);
    });
  });

  // About Me "open window" links
  document.querySelectorAll('[data-open]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      openWindow(link.dataset.open);
    });
  });
});

// ============================================================
// APPLE MENU DROPDOWN
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const btn      = document.getElementById('apple-btn');
  const dropdown = document.getElementById('apple-dropdown');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => dropdown.classList.remove('open'));
});

function shutdownSite() {
  document.getElementById('apple-dropdown').classList.remove('open');
  // Fade to grey then show a cheeky message
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: '#c0c0c0',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    zIndex: '999999', fontFamily: 'Geneva, Helvetica, sans-serif',
    fontSize: '16px', textAlign: 'center', gap: '16px', opacity: '0',
    transition: 'opacity 0.4s'
  });
  overlay.innerHTML = `
    <svg viewBox="0 0 64 76" width="56" height="66">
      <rect x="1" y="1" width="62" height="66" rx="6" fill="#e0e0e0" stroke="#888" stroke-width="1.5"/>
      <rect x="7" y="6" width="50" height="36" rx="3" fill="#555"/>
      <rect x="10" y="9" width="44" height="30" rx="1" fill="#222"/>
      <circle cx="24" cy="21" r="3.5" fill="#fff"/>
      <circle cx="40" cy="21" r="3.5" fill="#fff"/>
      <path d="M 21 32 Q 32 28 43 32" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
      <rect x="8" y="58" width="48" height="9" rx="3" fill="#d0d0d0" stroke="#bbb" stroke-width="1"/>
    </svg>
    <p>It is now safe to close your browser.</p>
    <button onclick="location.reload()"
      style="padding:4px 16px;font-family:Geneva,Helvetica,sans-serif;font-size:12px;
             background:#c0c0c0;border:2px solid;border-color:#fff #808080 #808080 #fff;
             cursor:pointer;margin-top:8px;">
      Restart
    </button>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { overlay.style.opacity = '1'; });
}

// ============================================================
// NOTES / BLOG
// ============================================================

function initNotes() {
  const sidebar = document.getElementById('notes-sidebar');

  POSTS.forEach((post, i) => {
    const item = document.createElement('div');
    item.className = 'post-item';
    item.innerHTML = `
      <span class="post-title">${post.title}</span>
      <span class="post-date">${post.date}</span>
    `;
    item.addEventListener('click', () => selectPost(post.id, item));
    sidebar.appendChild(item);

    // Auto-select first post
    if (i === 0) selectPost(post.id, item);
  });
}

function selectPost(postId, itemEl) {
  const post = POSTS.find(p => p.id === postId);
  if (!post) return;

  document.querySelectorAll('.post-item').forEach(el => el.classList.remove('active'));
  itemEl.classList.add('active');

  document.getElementById('notes-body').innerHTML = `
    <div class="post-content-header">
      <h2 class="post-content-title">${post.title}</h2>
      <div class="post-content-meta">${post.date}</div>
    </div>
    <div class="post-content-body">${post.body}</div>
  `;
}

// ============================================================
// MAIL
// ============================================================

function sendMail() {
  const from    = document.getElementById('mail-from').value.trim();
  const subject = document.getElementById('mail-subject').value.trim();
  const body    = document.getElementById('mail-body').value.trim();

  if (!from) {
    alert('Please enter your email address so I can reply.');
    document.getElementById('mail-from').focus();
    return;
  }
  if (!body) {
    alert('Your message is empty!');
    document.getElementById('mail-body').focus();
    return;
  }

  const fullBody = body + '\n\n— Sent via brandonpenn.com\nFrom: ' + from;
  const mailto = `mailto:${MY_EMAIL}`
    + `?subject=${encodeURIComponent(subject || 'Hello!')}`
    + `&body=${encodeURIComponent(fullBody)}`;

  window.location.href = mailto;
}
