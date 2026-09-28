/* Згода на аналітику і GA4 — один файл для головної і для всіх сторінок блогу.

   Поки відвідувач не натиснув «Accept», від Google не вантажиться нічого: ні
   gtag.js, ні жодного запиту. «Decline» записується і діє на всіх наступних
   візитах. Вибір живе в localStorage під ключем 'rf-consent' ('granted' або
   'denied'); якщо сховище заблоковане, сторінка працює як звичайно, а панель
   просто з'являється знову на кожному візиті.

   Google Consent Mode тут свідомо немає: він потрібен, коли тег вантажиться до
   вибору, а тут тег до вибору не вантажиться ніколи. Докладніше — docs/analytics.md. */

(function () {
  var GA_ID = 'G-R3BMKMWYYB';
  var KEY = 'rf-consent';
  var loaded = false;
  var bar = null;
  var opener = null;

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'granted' || v === 'denied' ? v : null;
    } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* сховище заблоковане — спитаємо знову наступного разу */ }
  }

  function loadGA() {
    window['ga-disable-' + GA_ID] = false;
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  /* Людина передумала після «Accept»: вивантажити скрипт не можна, але цей
     прапорець зупиняє всі подальші відправки, а куки GA ми прибираємо. */
  function stopGA() {
    window['ga-disable-' + GA_ID] = true;
    var host = location.hostname.split('.').slice(-2).join('.');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        var gone = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.cookie = gone;
        document.cookie = gone + '; domain=.' + host;
      }
    });
  }

  /* Єдиний вхід для подій зі сторінки. Без згоди — нічого не робить. Сюди
     передаються лише фіксовані назви й значення з коду, ніколи не текст,
     який ввела людина. */
  window.rfTrack = function (name, params) {
    if (read() !== 'granted' || !loaded || window['ga-disable-' + GA_ID]) return;
    window.gtag('event', name, params || {});
  };

  /* Один рядок навіть на телефоні: на низькому екрані (390×664, реальний iPhone
     у Safari) вища панель закривала кнопку верхньої форми. */
  var CSS =
    '.rf-consent{position:fixed;left:0;right:0;bottom:0;z-index:50;' +
      'background:var(--card);color:var(--ink);border-top:1px solid var(--line);box-shadow:var(--shadow);' +
      'padding:12px 0;padding-bottom:calc(12px + env(safe-area-inset-bottom));' +
      'animation:rf-consent-in .2s ease}' +
    '@keyframes rf-consent-in{from{transform:translateY(100%)}to{transform:translateY(0)}}' +
    '.rf-consent[hidden]{display:none}' +
    '.rf-consent .rf-inner{width:100%;max-width:1000px;margin:0 auto;padding:0 24px;' +
      'display:flex;align-items:center;gap:12px}' +
    '.rf-consent p{margin:0;flex:1 1 auto;min-width:0;font-size:14.5px;line-height:1.35;color:var(--muted)}' +
    '.rf-consent .rf-actions{display:flex;gap:8px;flex:none}' +
    '.rf-consent button{font:inherit;font-weight:700;font-size:14px;padding:8px 16px;border-radius:9px;' +
      'cursor:pointer;border:1px solid var(--accent);transition:opacity .15s ease}' +
    '.rf-consent button:hover{opacity:.88}' +
    '.rf-consent button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}' +
    '.rf-consent .rf-yes{background:var(--accent);color:var(--bg)}' +
    '.rf-consent .rf-no{background:transparent;color:var(--ink);border-color:var(--line)}' +
    '@media (max-width:640px){.rf-consent .rf-inner{padding:0 20px}' +
      '.rf-consent p{font-size:14px}.rf-consent button{font-size:13.5px;padding:8px 13px}}' +
    '@media (prefers-reduced-motion: reduce){.rf-consent{animation:none}}';

  function build() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    bar = document.createElement('div');
    bar.className = 'rf-consent';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Analytics cookies');
    bar.hidden = true;
    bar.innerHTML =
      '<div class="rf-inner">' +
        '<p>Allow analytics cookies?</p>' +
        '<div class="rf-actions">' +
          '<button type="button" class="rf-yes">Accept</button>' +
          '<button type="button" class="rf-no">Decline</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bar);

    bar.querySelector('.rf-yes').addEventListener('click', function () { choose('granted'); });
    bar.querySelector('.rf-no').addEventListener('click', function () { choose('denied'); });
  }

  /* Панель фіксована внизу, тож вмісту вона не зсуває. Щоб вона не закривала
     нижню форму, коли людина догортає до кінця, додаємо знизу сторінки відступ
     на її висоту — він лише подовжує сторінку, нічого вище не рухається. */
  function show(focus) {
    bar.hidden = false;
    document.body.style.paddingBottom = bar.offsetHeight + 'px';
    if (focus) bar.querySelector('.rf-yes').focus();
  }
  function hide() {
    bar.hidden = true;
    document.body.style.paddingBottom = '';
  }

  function choose(v) {
    write(v);
    hide();
    if (v === 'granted') loadGA(); else stopGA();
    if (opener) { opener.focus(); opener = null; }
  }

  function init() {
    build();
    window.addEventListener('resize', function () { if (!bar.hidden) show(false); });
    var buttons = document.querySelectorAll('[data-consent-open]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        opener = e.currentTarget;
        show(true);
      });
    }
    var choice = read();
    if (choice === 'granted') loadGA();
    else if (choice === null) show(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
