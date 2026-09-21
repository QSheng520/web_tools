/* =========================================================
   工具函数
   ========================================================= */
const fmt = (n) => (Number(n) || 0).toLocaleString('zh-CN', {
  minimumFractionDigits: 2, maximumFractionDigits: 2
});
const pad2 = (n) => String(n).padStart(2, '0');

/* 等额本息：已知本金/月利率/期数 → 月供 */
function calcMonthlyPayment(P, r, n) {
  if (n <= 0) return 0;
  if (r === 0) return P / n;
  const f = Math.pow(1 + r, n);
  return (P * r * f) / (f - 1);
}

/* 等额本息：已知月供/月利率/期数 → 对应的本金 */
function calcPrincipalFromPayment(M, r, n) {
  if (n <= 0) return 0;
  if (r === 0) return M * n;
  return (M * (1 - Math.pow(1 + r, -n))) / r;
}

/* =========================================================
   全局状态
   ========================================================= */
const state = {
  config: null,     // {principal, periods, annualRate, startYear, startMonth}
  prepays: {},      // 'YYYY-MM' -> {mode:'reducePayment'|'reduceTerm', delta, k}
  drafts: {},       // 编辑中的草稿
  openKey: null,    // 当前展开的面板 key
  result: null,
};

/* =========================================================
   提前还款试算
   ========================================================= */
function applyPrepay(ev, remaining, left, pay, r) {
  if (!ev) return { error: '无数据' };

  if (ev.mode === 'reducePayment') {
    /* —— 期数不变，月供减少 ——
       输入：每月减少金额 delta
       反推：新月供 = 旧月供 - delta，其对应的本金 P'
            需还款 = 当前剩余本金 - P'                       */
    const delta = Number(ev.delta);
    if (!(delta > 0)) return { error: '请输入每月减少的月供金额' };
    const newPay = pay - delta;
    if (newPay <= 0) return { error: '每月减少金额不能大于当前月供' };

    const targetP = calcPrincipalFromPayment(newPay, r, left);
    const amount = remaining - targetP;
    if (amount <= 0.005) return { error: '每月减少金额过大，无需额外还款' };
    if (amount >= remaining) {
      return { amount: remaining, remaining: 0, pay: newPay, left: 0 };
    }
    return { amount, remaining: remaining - amount, pay: newPay, left };

  } else {
    /* —— 月供不变，减少期数 ——
       输入：减少期数 k
       反推：新月数 = 剩余期数 - k，其对应的本金 P'
            需还款 = 当前剩余本金 - P'                       */
    const k = Number(ev.k);
    if (!(k > 0)) return { error: '请输入要减少的期数' };
    const newLeft = left - k;
    if (newLeft < 1) return { error: '减少期数过多，至少保留 1 期' };

    const targetP = calcPrincipalFromPayment(pay, r, newLeft);
    const amount = remaining - targetP;
    if (amount <= 0.005) return { error: '减少期数过多，无需额外还款' };
    if (amount >= remaining) {
      return { amount: remaining, remaining: 0, pay, left: 0 };
    }
    return { amount, remaining: remaining - amount, pay, left: newLeft };
  }
}

/* =========================================================
   生成还款计划
   ========================================================= */
function buildSchedule() {
  const cfg = state.config;
  const r = cfg.annualRate / 100 / 12;

  let remaining = cfg.principal;
  let left = cfg.periods;
  let pay = calcMonthlyPayment(remaining, r, left);
  const firstPay = pay;

  let y = cfg.startYear;
  let m = cfg.startMonth;

  const rows = [];
  let totalInterest = 0;
  let totalPayment = 0;
  let guard = 0;

  while (remaining > 0.005 && left > 0 && guard < 20000) {
    guard++;

    const interest = remaining * r;
    let principalPart;
    let payment;

    if (left === 1) {
      /* 最后一期结清 */
      principalPart = remaining;
      payment = principalPart + interest;
    } else {
      principalPart = pay - interest;
      if (principalPart < 0) principalPart = 0;
      if (principalPart > remaining) principalPart = remaining;
      payment = principalPart + interest;
    }

    remaining -= principalPart;
    if (remaining < 0.005) remaining = 0;
    left--;
    totalInterest += interest;
    totalPayment += payment;

    const key = `${y}-${pad2(m)}`;
    const row = {
      n: rows.length + 1,
      year: y,
      month: m,
      payment,
      principalPart,
      interest,
      remaining,
      left,
      currentPay: pay,                 // 该期所用的月供
      prepayKey: (m === 12 && remaining > 0.005) ? key : null,
      prepay: null,
      prepayError: null,
    };
    rows.push(row);

    /* ---------- 12 月：执行提前还款 ---------- */
    if (row.prepayKey && state.prepays[key]) {
      const ev = state.prepays[key];
      const res = applyPrepay(ev, remaining, left, pay, r);

      if (res.error) {
        row.prepayError = res.error;
      } else {
        const amount = Math.round(res.amount * 100) / 100;
        const rem2 = Math.max(0, remaining - amount);

        row.prepay = {
          mode: ev.mode,
          amount,
          remainingAfter: rem2,
          payBefore: pay,
          payAfter: res.pay,
          leftBefore: left,
          leftAfter: res.left,
        };

        remaining = rem2;
        left = res.left;
        pay = res.pay;
        totalPayment += amount;
      }
    }

    m++;
    if (m > 12) { m = 1; y++; }
  }

  const last = rows[rows.length - 1] || { year: cfg.startYear, month: cfg.startMonth };

  return {
    rows,
    firstPay,
    totalInterest,
    totalPayment,
    periodsUsed: rows.length,
    endYear: last.year,
    endMonth: last.month,
  };
}

/* =========================================================
   渲染
   ========================================================= */
function render() {
  if (!state.config) return;
  const res = buildSchedule();
  state.result = res;
  renderSummary(res);
  renderTable(res);
  document.querySelectorAll('.prepay-form').forEach(updatePreview);
}

function renderSummary(res) {
  const el = document.getElementById('summary');
  el.classList.add('show');
  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat"><span class="label">首期月供</span>
        <span class="value">${fmt(res.firstPay)}<small>元</small></span></div>
      <div class="stat"><span class="label">还款总额</span>
        <span class="value">${fmt(res.totalPayment)}<small>元</small></span></div>
      <div class="stat"><span class="label">支付利息</span>
        <span class="value">${fmt(res.totalInterest)}<small>元</small></span></div>
      <div class="stat"><span class="label">实际还款期数</span>
        <span class="value">${res.periodsUsed}<small>期</small></span></div>
      <div class="stat"><span class="label">预计结清时间</span>
        <span class="value">${res.endYear}年${res.endMonth}月</span></div>
    </div>`;
}

function renderTable(res) {
  const tbody = document.getElementById('tbody');
  if (!res.rows.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty">暂无数据</td></tr>`;
    return;
  }

  const html = [];
  let lastYear = null;

  for (const row of res.rows) {
    if (row.year !== lastYear) {
      lastYear = row.year;
      html.push(`<tr class="year-row"><td colspan="7">${row.year} 年</td></tr>`);
    }

    html.push(`
      <tr class="data-row ${row.prepay ? 'has-prepay' : ''}">
        <td class="muted">${row.n}</td>
        <td>${row.year}-${pad2(row.month)}</td>
        <td class="num">${fmt(row.payment)}</td>
        <td class="num">${fmt(row.principalPart)}</td>
        <td class="num">${fmt(row.interest)}</td>
        <td class="num strong">${fmt(row.remaining)}</td>
        <td class="num ${row.left === 0 ? 'muted' : ''}">${row.left}</td>
      </tr>`);

    if (row.prepayKey) {
      html.push(`<tr class="prepay-row"><td colspan="7">${prepayCellHtml(row)}</td></tr>`);
    }
  }

  tbody.innerHTML = html.join('');
}

/* --------- 提前还款单元格 --------- */
function prepayCellHtml(row) {
  const key = row.prepayKey;
  const ev = state.prepays[key];
  const isOpen = state.openKey === key;

  if (isOpen) {
    return prepayFormHtml(row);
  }

  if (row.prepayError) {
    return `<div class="prepay-done">
      <span class="err" style="color:var(--red)">⚠ 提前还款设置无效：${row.prepayError}</span>
      <button class="btn sm" data-action="edit-prepay" data-key="${key}">修改</button>
      <button class="btn sm danger" data-action="delete-prepay" data-key="${key}">删除</button>
    </div>`;
  }

  if (ev && row.prepay) {
    const p = row.prepay;
    let desc;
    if (p.mode === 'reducePayment') {
      desc = `期数不变，月供 ${fmt(p.payBefore)} → <b>${fmt(p.payAfter)}</b> 元`;
    } else {
      desc = `月供不变，剩余期数 ${p.leftBefore} → <b>${p.leftAfter}</b> 期`;
    }
    return `<div class="prepay-done">
      <span class="ok">✓ ${row.year}年12月 提前还款</span>
      <span>还款 <b>${fmt(p.amount)}</b> 元，${desc}</span>
      <button class="btn sm" data-action="edit-prepay" data-key="${key}">修改</button>
      <button class="btn sm danger" data-action="delete-prepay" data-key="${key}">删除</button>
    </div>`;
  }

  return `<button class="prepay-trigger" data-action="open-prepay" data-key="${key}">
      ＋ 提前还款
    </button>`;
}

/* --------- 提前还款表单 --------- */
function prepayFormHtml(row) {
  const key = row.prepayKey;
  const draft = state.drafts[key] || {};
  const mode = draft.mode || 'reducePayment';
  const deltaVal = draft.delta != null && draft.delta !== '' ? draft.delta : '';
  const kVal = draft.k != null && draft.k !== '' ? draft.k : '';

  return `
  <div class="prepay-form"
       data-key="${key}"
       data-mode="${mode}"
       data-remaining="${row.remaining}"
       data-left="${row.left}"
       data-pay="${row.currentPay}">
    <div class="prepay-title">${row.year} 年 12 月 · 提前还款</div>

    <div class="prepay-tabs">
      <button type="button" class="tab ${mode === 'reducePayment' ? 'active' : ''}"
              data-tab="reducePayment">期数不变 · 减少月供</button>
      <button type="button" class="tab ${mode === 'reduceTerm' ? 'active' : ''}"
              data-tab="reduceTerm">月供不变 · 减少期数</button>
    </div>

    <div class="prepay-field" data-for="reducePayment"
         style="${mode === 'reducePayment' ? '' : 'display:none'}">
      <label>每月减少</label>
      <input type="number" name="delta" min="0" step="100"
             value="${deltaVal}" placeholder="例如 500">
      <span class="unit">元</span>
    </div>

    <div class="prepay-field" data-for="reduceTerm"
         style="${mode === 'reduceTerm' ? '' : 'display:none'}">
      <label>减少期数</label>
      <input type="number" name="k" min="1" step="1"
             value="${kVal}" placeholder="例如 12">
      <span class="unit">期</span>
    </div>

    <div class="prepay-preview"></div>

    <div class="prepay-actions">
      <button type="button" class="btn primary" data-action="confirm-prepay">确认还款</button>
      <button type="button" class="btn ghost" data-action="cancel-prepay">取消</button>
    </div>
  </div>`;
}

/* --------- 读取表单草稿 --------- */
function readDraft(form) {
  const mode = form.dataset.mode;
  if (mode === 'reducePayment') {
    const v = parseFloat(form.querySelector('[name="delta"]').value);
    return { mode, delta: isNaN(v) ? 0 : v };
  }
  const v = parseInt(form.querySelector('[name="k"]').value, 10);
  return { mode, k: isNaN(v) ? 0 : v };
}

/* --------- 实时预览 --------- */
function updatePreview(form) {
  if (!form || !state.config) return;
  const key = form.dataset.key;
  const draft = readDraft(form);
  state.drafts[key] = draft;

  const r = state.config.annualRate / 100 / 12;
  const remaining = parseFloat(form.dataset.remaining);
  const left = parseInt(form.dataset.left, 10);
  const pay = parseFloat(form.dataset.pay);

  const res = applyPrepay(draft, remaining, left, pay, r);
  const previewEl = form.querySelector('.prepay-preview');
  const confirmBtn = form.querySelector('[data-action="confirm-prepay"]');

  if (res.error) {
    previewEl.innerHTML = `<span class="err">${res.error}</span>`;
    confirmBtn.disabled = true;
    return;
  }

  confirmBtn.disabled = false;

  let extra = '';
  if (res.left === 0) {
    extra = '本笔将结清全部贷款';
  } else if (draft.mode === 'reducePayment') {
    extra = `月供变为 ${fmt(res.pay)} 元`;
  } else {
    extra = `剩余期数变为 ${res.left} 期`;
  }

  previewEl.innerHTML =
    `需提前还款 <strong>${fmt(res.amount)}</strong> 元 · ${extra}`;
}

/* =========================================================
   事件绑定
   ========================================================= */
const tbody = document.getElementById('tbody');

/* 切换模式 */
function switchMode(form, mode) {
  form.dataset.mode = mode;
  form.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('active', t.dataset.tab === mode));
  form.querySelectorAll('.prepay-field').forEach(f => {
    f.style.display = f.dataset.for === mode ? '' : 'none';
  });
  updatePreview(form);
}

/* 输入时只刷新预览，不重建表格（避免失焦） */
tbody.addEventListener('input', (e) => {
  if (e.target.matches('input[name="delta"], input[name="k"]')) {
    updatePreview(e.target.closest('.prepay-form'));
  }
});

/* 点击 */
tbody.addEventListener('click', (e) => {
  /* 模式切换 */
  const tabBtn = e.target.closest('.tab');
  if (tabBtn) {
    switchMode(tabBtn.closest('.prepay-form'), tabBtn.dataset.tab);
    return;
  }

  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const key = btn.dataset.key;

  if (action === 'open-prepay' || action === 'edit-prepay') {
    const existing = state.prepays[key];
    state.drafts[key] = existing
      ? { ...existing }
      : { mode: 'reducePayment', delta: '', k: '' };
    state.openKey = key;
    render();
  }
  else if (action === 'cancel-prepay') {
    const form = btn.closest('.prepay-form');
    if (form) delete state.drafts[form.dataset.key];
    state.openKey = null;
    render();
  }
  else if (action === 'confirm-prepay') {
    const form = btn.closest('.prepay-form');
    const draft = readDraft(form);
    const check = applyPrepay(
      draft,
      parseFloat(form.dataset.remaining),
      parseInt(form.dataset.left, 10),
      parseFloat(form.dataset.pay),
      state.config.annualRate / 100 / 12
    );
    if (check.error) {
      alert(check.error);
      return;
    }
    state.prepays[form.dataset.key] = draft;
    state.openKey = null;
    render();
  }
  else if (action === 'delete-prepay') {
    delete state.prepays[key];
    delete state.drafts[key];
    state.openKey = null;
    render();
  }
});

/* 生成按钮 */
document.getElementById('calcBtn').addEventListener('click', () => {
  const principal = parseFloat(document.getElementById('amount').value) || 0;
  const periods = parseInt(document.getElementById('periods').value, 10) || 0;
  const annualRate = parseFloat(document.getElementById('rate').value) || 0;
  const sd = document.getElementById('startDate').value;

  if (principal <= 0 || periods <= 0) {
    alert('请输入有效的贷款金额和贷款期数');
    return;
  }

  let startYear = 2025, startMonth = 1;
  if (sd) {
    const p = sd.split('-');
    startYear = parseInt(p[0], 10);
    startMonth = parseInt(p[1], 10);
  }

  state.config = { principal, periods, annualRate, startYear, startMonth };
  state.openKey = null;
  render();
});

/* 清空提前还款 */
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!Object.keys(state.prepays).length) return;
  if (!confirm('确定要清空所有提前还款设置吗？')) return;
  state.prepays = {};
  state.drafts = {};
  state.openKey = null;
  render();
});

/* 回车快捷生成 */
['amount', 'periods', 'rate', 'startDate'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('calcBtn').click();
  });
});

/* 首次加载 */
document.getElementById('calcBtn').click();
