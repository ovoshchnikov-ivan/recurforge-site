/* Перемикач теми і підписка для сторінок блогу.

   Обидва блоки скопійовані з index.html. Перемикач — той самий, з тим самим
   ключем 'rf-theme' і тими самими трьома станами; з нього прибрано лише роботу
   зі скріншотами головної, яких у блозі немає. Форма — та сама функція wire(),
   слово в слово, з тими самими GOOGLE_FORM_ID і GOOGLE_ENTRY_ID; вона просто
   обслуговує форму статті так само, як обслуговує дві форми на головній. */

(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeToggle');
  var meta = document.getElementById('theme-color');
  if (!btn) return;
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function active() {
    return root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');
  }
  function paint() {
    var t = active();
    if (meta) meta.setAttribute('content', t === 'dark' ? '#14161A' : '#FFFFFF');
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  btn.addEventListener('click', function () {
    var next = active() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('rf-theme', next); } catch (e) {}
    paint();
  });
  /* Поки користувач нічого не обрав — слухаємо системну тему й міняємось разом із нею. */
  systemDark.addEventListener('change', function () {
    if (!root.hasAttribute('data-theme')) paint();
  });
  paint();
})();

/* Поле на сторінці — своє, а відправляється воно у приховану Гугл-форму,
   звідки відповіді падають у таблицю.

   Обидва значення нижче не є секретами — це лише адреса, куди слати відповіді. */
var GOOGLE_FORM_ID = '1FAIpQLSe4UjeCcxwpL82161DCguQyF9ZLUdobFDsvBP1WGjyoUfoj7A';
var GOOGLE_ENTRY_ID = 'entry.875920068';

(function () {
  var IDLE = 'One email when it opens. Nothing else, ever.';

  function wire(boxId, formId, inputId, btnId, noteId) {
    var box = document.getElementById(boxId);
    var form = document.getElementById(formId);
    var input = document.getElementById(inputId);
    var btn = document.getElementById(btnId);
    var note = document.getElementById(noteId);
    if (!box || !form || !input || !btn || !note) return;

    function say(text, isError) {
      note.textContent = text;
      note.classList.toggle('error', !!isError);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = input.value.trim();

      /* Перевіряємо на своєму боці: Google відповіді не віддає (браузер її не бачить),
         тож єдина чесна валідація — тут, до відправки. */
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        say('That does not look like an email address.', true);
        input.focus();
        return;
      }
      if (GOOGLE_FORM_ID === 'PASTE_FORM_ID') {
        say('Form is not connected yet.', true);
        return;
      }

      btn.disabled = true;
      say('Sending…');

      var body = new URLSearchParams();
      body.append(GOOGLE_ENTRY_ID, value);

      fetch('https://docs.google.com/forms/d/e/' + GOOGLE_FORM_ID + '/formResponse', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      }).then(finish, finish);

      /* no-cors означає, що відповідь непрозора: підтвердити доставку неможливо.
         Тому показуємо успіх в обох випадках, а надійність перевіряємо тестовим
         записом у таблиці після деплою. */
      function finish() {
        box.setAttribute('data-state', 'done');
        say('Got it. You will hear from me when it opens.');
      }
    });

    input.addEventListener('input', function () {
      if (note.classList.contains('error')) say(IDLE);
    });
  }

  /* Форма на статті — з тими самими id, що й перша форма на головній,
     тому wire() підключає її без жодних змін. */
  wire('signup', 'signupForm', 'email', 'submitBtn', 'note');
})();

/* Кнопка «Copy link» під статтею. navigator.clipboard буває відсутній або кидає
   помилку (не https, вбудований перегляд, заборона браузера) — тоді копіюємо
   старим способом через прихований textarea, а не мовчки нічого не робимо. */
(function () {
  var btn = document.querySelector('.copy-link');
  if (!btn) return;
  var idle = btn.getAttribute('aria-label');
  var timer;

  function fallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }

  function show(ok) {
    btn.setAttribute('aria-label', ok ? 'Link copied' : 'Could not copy the link');
    btn.classList.toggle('copied', ok);
    clearTimeout(timer);
    timer = setTimeout(function () {
      btn.setAttribute('aria-label', idle);
      btn.classList.remove('copied');
    }, 2000);
  }

  btn.addEventListener('click', function () {
    var url = btn.getAttribute('data-url');
    try {
      navigator.clipboard.writeText(url).then(
        function () { show(true); },
        function () { show(fallback(url)); }
      );
    } catch (e) {
      show(fallback(url));
    }
  });
})();
