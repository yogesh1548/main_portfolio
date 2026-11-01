(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var WHATSAPP = '9779827745294';

  /* ---------- Safe storage helpers ---------- */
  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

  /* ---------- Image fallbacks (missing files show a placeholder) ---------- */
  $$('img[data-fallback]').forEach(function (img) {
    function swap() {
      var fb = img.getAttribute('data-fallback');
      if (fb && img.getAttribute('src') !== fb) { img.setAttribute('src', fb); }
    }
    img.addEventListener('error', swap);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) { swap(); }
  });

  /* ---------- Footer year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var themeBtn = $('#themeToggle');
  function syncThemeLabel() {
    var dark = root.getAttribute('data-theme') === 'dark';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0d1520' : '#13408a');
  }
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store('theme', next);
    syncThemeLabel();
  });
  syncThemeLabel();

  /* ---------- Header, scroll progress, back-to-top ---------- */
  var header = $('#header');
  var progress = $('#scrollProgress');
  var toTop = $('#toTop');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 10);
    progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    toTop.hidden = y < 600;
    updateActive(y);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Mobile menu ---------- */
  var navToggle = $('#navToggle');
  var navMenu = $('#navMenu');
  function setMenu(open) {
    navMenu.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  }
  navToggle.addEventListener('click', function () { setMenu(!navMenu.classList.contains('open')); });
  navMenu.addEventListener('click', function (e) { if (e.target.classList.contains('nav-link')) setMenu(false); });
  document.addEventListener('click', function (e) { if (!header.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Active nav link ---------- */
  var links = $$('.nav-link');
  var sections = links.map(function (l) { return $(l.getAttribute('href')); });
  function updateActive(y) {
    var pos = y + 140;
    var current = 0;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= pos) current = i; });
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) current = links.length - 1;
    links.forEach(function (l, i) { l.classList.toggle('active', i === current); });
  }

  /* ---------- Typing effect ---------- */
  var typed = $('#typed');
  var words = ['responsive websites', 'web applications', 'AI-powered tools', 'clean, reliable code'];
  if (typed && !reduceMotion) {
    var wi = 0, ci = words[0].length, deleting = true;
    (function tick() {
      var w = words[wi];
      if (deleting) { ci--; } else { ci++; }
      typed.textContent = w.slice(0, ci);
      var delay = deleting ? 40 : 85;
      if (!deleting && ci === w.length) { delay = 1600; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 300; }
      setTimeout(tick, delay);
    })();
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 4) * 70) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Animated counters ---------- */
  var counts = {
    projects: $$('.project-card').length,
    skills: $$('.skill-card .tag-list li').length,
    certs: $$('.gallery-item').length
  };
  function animateCount(el) {
    var key = el.getAttribute('data-count');
    var target = counts.hasOwnProperty(key) ? counts[key] : parseInt(key, 10);
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, dur = 1200;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  var statEls = $$('.stat-num');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    statEls.forEach(function (el) { cio.observe(el); });
  } else {
    statEls.forEach(animateCount);
  }

  /* ---------- Project filter + search ---------- */
  var projectCards = $$('.project-card');
  var projectEmpty = $('#projectEmpty');
  var searchInput = $('#projectSearch');
  var projectFilter = 'all';

  function applyProjectFilter() {
    var q = (searchInput.value || '').trim().toLowerCase();
    var shown = 0;
    projectCards.forEach(function (card) {
      var okCat = projectFilter === 'all' || card.getAttribute('data-category') === projectFilter;
      var okText = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
      card.hidden = !(okCat && okText);
      if (!card.hidden) shown++;
    });
    projectEmpty.hidden = shown !== 0;
  }
  $$('#projects .filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('#projects .filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      projectFilter = btn.getAttribute('data-filter');
      applyProjectFilter();
    });
  });
  searchInput.addEventListener('input', applyProjectFilter);

  /* ---------- Achievements filter ---------- */
  var items = $$('.gallery-item');
  $$('#achievements .filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('#achievements .filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      items.forEach(function (it) { it.hidden = !(f === 'all' || it.getAttribute('data-category') === f); });
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = $('#lightbox');
  var lbImg = $('#lbImg');
  var lbCaption = $('#lbCaption');
  var lbClose = $('#lbClose');
  var lbIndex = 0, lbList = [], lastFocus = null, touchX = null;

  function visibleButtons() {
    return items.filter(function (it) { return !it.hidden; }).map(function (it) { return $('.gallery-btn', it); });
  }
  function showPhoto(i) {
    lbIndex = (i + lbList.length) % lbList.length;
    var b = lbList[lbIndex];
    var thumb = $('img', b);
    lbImg.onerror = function () { lbImg.onerror = null; lbImg.src = thumb.currentSrc || thumb.src; };
    lbImg.src = b.getAttribute('data-full');
    lbImg.alt = thumb.alt;
    lbCaption.textContent = b.getAttribute('data-caption');
  }
  function openLightbox(btn) {
    lastFocus = btn;
    lbList = visibleButtons();
    showPhoto(lbList.indexOf(btn));
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $('#gallery').addEventListener('click', function (e) {
    var btn = e.target.closest('.gallery-btn');
    if (btn) openLightbox(btn);
  });
  lbClose.addEventListener('click', closeLightbox);
  $('#lbPrev').addEventListener('click', function () { showPhoto(lbIndex - 1); });
  $('#lbNext').addEventListener('click', function () { showPhoto(lbIndex + 1); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
  lightbox.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPhoto(lbIndex - 1);
    if (e.key === 'ArrowRight') showPhoto(lbIndex + 1);
  });

  /* ---------- Quick message -> WhatsApp ---------- */
  var quickForm = $('#quickForm');
  var qfError = $('#qfError');
  quickForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#qfName').value.trim();
    var msg = $('#qfMsg').value.trim();
    if (!name || !msg) { qfError.hidden = false; return; }
    qfError.hidden = true;
    var text = 'Hello Yogesh, I am ' + name + '.\n\n' + msg;
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  /* ---------- Copy email ---------- */
  var copyBtn = $('#copyEmail');
  var copyText = $('#copyEmailText');
  var EMAIL = 'Yogeshs1548@gmail.com';
  function flash(label) {
    copyText.textContent = label;
    setTimeout(function () { copyText.textContent = 'Copy email'; }, 1800);
  }
  copyBtn.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(function () { flash('Copied!'); }, function () { flash(EMAIL); });
    } else {
      flash(EMAIL);
    }
  });

  /* ---------- Rule-based chatbot ---------- */
  var FALLBACK = "I'm sorry, I can only answer questions based on the information provided in Yogesh's CV. For other inquiries, please use the contact information provided.";

  var KB = [
    {
      label: 'Educational background',
      question: 'What is his educational background?',
      keywords: ['education', 'educational', 'study', 'studies', 'studied', 'studying', 'college', 'school', 'gpa', 'qualification', 'qualifications', 'bachelor', 'intermediate', 'see', 'degree', 'academic', 'csit', 'university', 'trinity'],
      answer: "Yogesh is currently pursuing a Bachelor's in BSc. CSIT at Trinity International College. He completed his Intermediate from Himalayan Whitehouse College with a 3.30 GPA and his SEE from Ratna Rajya Secondary School with a 3.55 GPA."
    },
    {
      label: 'Projects',
      question: 'What projects has he done?',
      keywords: ['project', 'projects', 'built', 'developed', 'portfolio', 'ecommerce', 'commerce', 'rental', 'vehicle', 'todo', 'reminder', 'agents', 'agent', 'experiments', 'work'],
      answer: 'His projects include a personal portfolio, a vehicle rental system website, a To-Do list website, a reminder system, AI agents, an e-commerce website, and other experiments. See the <a href="#projects">Projects</a> section for details.'
    },
    {
      label: 'Technical skills',
      question: 'What are his technical skills?',
      keywords: ['skill', 'skills', 'technical', 'technology', 'technologies', 'tech', 'programming', 'languages', 'language', 'proficient', 'web', 'database', 'databases', 'backend', 'git', 'python', 'java', 'html', 'css', 'javascript', 'mysql', 'php', 'node', 'know', 'expertise'],
      answer: "He is proficient in web development (HTML, CSS, JavaScript), programming (Python, Java, C/C++), database management (MySQL), backend development (PHP, Node.js), and version control (Git, GitHub)."
    },
    {
      label: 'Location',
      question: 'Where is he located?',
      keywords: ['located', 'location', 'address', 'live', 'lives', 'living', 'based', 'tikathali', 'lalitpur', 'city', 'place', 'residence', 'stay'],
      weak: ['where'],
      answer: "He is based in Tikathali, Lalitpur, which is near the Bhagawati Temple."
    },
    {
      label: 'Contact',
      question: 'How can I contact him?',
      keywords: ['contact', 'phone', 'email', 'mail', 'reach', 'linkedin', 'call', 'number', 'connect', 'message', 'hire', 'whatsapp', 'github'],
      answer: 'You can reach him by phone at +977 9827745294 or via email at Yogeshs1548@gmail.com. You can also connect with him on <a href="https://www.linkedin.com/in/yogesh-shah-ba49572a9" target="_blank" rel="noopener noreferrer">LinkedIn</a>, message him on <a href="https://wa.me/9779827745294" target="_blank" rel="noopener noreferrer">WhatsApp</a>, or view his code on <a href="https://github.com/yogesh1548" target="_blank" rel="noopener noreferrer">GitHub</a>.'
    },
    {
      label: 'Objective',
      question: 'What is his objective?',
      keywords: ['objective', 'goal', 'goals', 'aim', 'aims', 'aspire', 'aspiration', 'purpose', 'looking', 'seeking', 'career', 'ambition'],
      answer: "His objective is to apply his technical skills in web development and software development, gain practical experience, and contribute to organizational success."
    }
  ];

  var fab = $('#chatFab');
  var win = $('#chatWindow');
  var msgs = $('#chatMessages');
  var input = $('#chatInput');
  var suggestions = $('#chatSuggestions');
  var greeted = false;

  function addMessage(content, who, asText) {
    var d = document.createElement('div');
    d.className = 'msg ' + who;
    if (asText) d.textContent = content; else d.innerHTML = content;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function findAnswer(text) {
    var words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    var best = null, bestScore = 0;
    KB.forEach(function (entry) {
      var score = 0;
      words.forEach(function (w) {
        if (entry.keywords.indexOf(w) !== -1) score += 1;
        else if (entry.weak && entry.weak.indexOf(w) !== -1) score += 0.5;
      });
      if (score > bestScore) { bestScore = score; best = entry; }
    });
    return bestScore >= 1 ? best.answer : FALLBACK;
  }
  function ask(text) {
    var t = text.trim();
    if (!t) return;
    addMessage(t, 'user', true);
    setTimeout(function () { addMessage(findAnswer(t), 'bot', false); }, 350);
  }
  function openChat() {
    win.hidden = false;
    document.body.classList.add('chat-open');
    fab.setAttribute('aria-expanded', 'true');
    if (!greeted) {
      addMessage("Hello! I'm the CV assistant. Ask me about Yogesh's education, projects, skills, location, contact details, or objective.", 'bot', true);
      greeted = true;
    }
    input.focus();
  }
  function closeChat() {
    win.hidden = true;
    document.body.classList.remove('chat-open');
    fab.setAttribute('aria-expanded', 'false');
    fab.focus();
  }
  KB.forEach(function (entry) {
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = entry.label;
    chip.addEventListener('click', function () { ask(entry.question); });
    suggestions.appendChild(chip);
  });
  fab.addEventListener('click', function () { if (win.hidden) openChat(); else closeChat(); });
  $('#chatClose').addEventListener('click', closeChat);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !win.hidden && lightbox.hidden) closeChat();
  });
  $('#chatForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = '';
    ask(v);
  });

  onScroll();
})();
