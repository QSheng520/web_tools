(function () {
  'use strict';

  /* ================= 数据配置 ================= */
  const TIME_SLOTS = ['19:00', '19:10', '19:20'];

  const SUBJECTS = {
    '思维': { emoji: '🧩', color: '#7c5cff', bg: '#efeaff' },
    '数学': { emoji: '🔢', color: '#2f80ed', bg: '#e6f0ff' },
    '拼音': { emoji: '🅰️', color: '#e08b1f', bg: '#fff3e0' },
    '阅读': { emoji: '📖', color: '#12a56a', bg: '#e2f8ee' },
    '英语': { emoji: '🔤', color: '#e0518a', bg: '#ffe9f2' }
  };

  const SCHEDULE = [
    { day: '周一', en: 'MON', lessons: ['思维', '阅读', '英语'] },
    { day: '周二', en: 'TUE', lessons: ['数学', '拼音', '阅读'] },
    { day: '周三', en: 'WED', lessons: ['思维', '英语', '数学'] },
    { day: '周四', en: 'THU', lessons: ['拼音', '阅读', '思维'] },
    { day: '周五', en: 'FRI', lessons: ['数学', '英语', '拼音'] },
    { day: '周六', en: 'SAT', lessons: ['阅读', '思维', '英语'] },
    { day: '周日', en: 'SUN', lessons: ['拼音', '数学', '阅读'] }
  ];

  const STORE_KEY = 'kids-study-plan-v1';
  const todayIdx = (new Date().getDay() + 6) % 7;   // 周一 = 0

  /* ================= 本地存储（每天自动重置） ================= */
  function todayStamp() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  let store = { date: todayStamp(), items: {} };
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY));
    if (raw && raw.date === store.date && raw.items) {
      store.items = raw.items;
    }
  } catch (e) { /* 忽略隐私模式等异常 */ }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
  }

  /* ================= 元素 ================= */
  const weekEl   = document.getElementById('week');
  const statsEl  = document.getElementById('stats');
  const tbText   = document.getElementById('tbText');
  const tbFill   = document.getElementById('tbFill');
  const tbCount  = document.getElementById('tbCount');
  const resetBtn = document.getElementById('resetBtn');

  /* ================= 渲染周课表 ================= */
  SCHEDULE.forEach(function (d, di) {
    const isToday = di === todayIdx;

    const lessonsHtml = d.lessons.map(function (subName, li) {
      const sub = SUBJECTS[subName];
      const id = di + '-' + li;
      const doneCls = store.items[id] ? ' done' : '';
      return '' +
        '<li class="lesson' + doneCls + '" data-id="' + id + '" ' +
            'style="--sc:' + sub.color + ';--sb:' + sub.bg + '">' +
          '<span class="emoji">' + sub.emoji + '</span>' +
          '<span class="name">' + subName + '</span>' +
          '<span class="time">' + TIME_SLOTS[li] + '</span>' +
          '<span class="check">✓</span>' +
        '</li>';
    }).join('');

    const card = document.createElement('section');
    card.className = 'day-card' + (isToday ? ' today' : '');
    card.style.animationDelay = (di * 55) + 'ms';
    card.innerHTML =
      '<div class="day-head">' +
        '<div class="day-name">' + d.day +
          '<span class="day-en">' + d.en + '</span>' +
        '</div>' +
        (isToday ? '<span class="today-badge">今天</span>' : '') +
      '</div>' +
      '<ul class="lessons">' + lessonsHtml + '</ul>';

    weekEl.appendChild(card);
  });

  /* ================= 渲染科目统计 ================= */
  const counts = {};
  SCHEDULE.forEach(function (d) {
    d.lessons.forEach(function (s) {
      counts[s] = (counts[s] || 0) + 1;
    });
  });

  statsEl.innerHTML = Object.keys(SUBJECTS).map(function (s) {
    const sub = SUBJECTS[s];
    return '<div class="stat" style="--sc:' + sub.color + '">' +
             '<i>' + sub.emoji + '</i>' + s +
             '<span class="cnt">' + (counts[s] || 0) + '次</span>' +
           '</div>';
  }).join('');

  /* ================= 进度更新 ================= */
  function countTodayDone() {
    let n = 0;
    for (let i = 0; i < 3; i++) {
      if (store.items[todayIdx + '-' + i]) n++;
    }
    return n;
  }

  function updateProgress() {
    const n = countTodayDone();
    tbFill.style.width = (n / 3 * 100) + '%';
    tbCount.textContent = n + '/3';
    tbText.textContent = (n === 3)
      ? '🎉 今天全部完成！'
      : '今天 ' + SCHEDULE[todayIdx].day;
  }

  /* ================= 点击打勾 ================= */
  weekEl.addEventListener('click', function (e) {
    const li = e.target.closest('.lesson');
    if (!li) return;

    const id = li.dataset.id;
    if (store.items[id]) {
      delete store.items[id];
      li.classList.remove('done');
    } else {
      store.items[id] = true;
      li.classList.add('done');
    }

    save();
    updateProgress();
  });

  /* ================= 清空今天 ================= */
  resetBtn.addEventListener('click', function () {
    Object.keys(store.items).forEach(function (k) {
      if (k.indexOf(todayIdx + '-') === 0) delete store.items[k];
    });

    const todayCard = weekEl.querySelector('.day-card.today');
    if (todayCard) {
      todayCard.querySelectorAll('.lesson.done').forEach(function (li) {
        li.classList.remove('done');
      });
    }

    save();
    updateProgress();
  });

  /* ================= 初始化 ================= */
  updateProgress();
})();
