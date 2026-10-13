(function () {
  'use strict';

  const codeEl     = document.getElementById('code');
  const outputEl   = document.getElementById('output');
  const viewportEl = document.getElementById('viewport');
  const errorEl    = document.getElementById('error');
  const themeSel   = document.getElementById('theme');

  /* ---------------- 初始内容：模板库中的流程图 ---------------- */
  const DEFAULT_TEMPLATE = MERMAID_TEMPLATES.find(t => t.id === 'flowchart');

  // 记录上次载入的内容，用户没手动改过时载入模板不再二次确认
  let lastLoadedCode = DEFAULT_TEMPLATE.code;
  codeEl.value = lastLoadedCode;

  /* -------- 隐藏容器：承接 mermaid 渲染时的临时 DOM -------- */
  // 必须给出真实尺寸：甘特图等图型按容器宽度计算 viewBox，
  // 容器为 0 宽时会渲染出 viewBox="0 0 0 148" 的空图
  const sandbox = document.createElement('div');
  sandbox.style.cssText = 'position:absolute;left:-9999px;top:0;width:1200px;height:800px;overflow:hidden;';
  document.body.appendChild(sandbox);

  /* ---------------- 渲染 ---------------- */
  let renderSeq = 0;

  function initMermaid(theme) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',          // 允许 htmlLabels 等
      theme: theme || 'default',
      fontFamily: 'system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif',
      flowchart: { htmlLabels: true, curve: 'basis' }
    });
  }

  function showError(msg) {
    if (!msg) { errorEl.hidden = true; errorEl.textContent = ''; return; }
    errorEl.hidden = false;
    errorEl.textContent = msg;
  }

  // 让 svg 回到固有尺寸
  // mermaid 输出的 svg 是 width="100%"，直接塞进预览区会被撑满整个宽度、图被放大好几倍，
  // 这里按 viewBox 还原成固有尺寸，尺寸怎么用交给各自的 CSS：
  // 预览区靠 transform 缩放，模板缩略图靠 max-width/max-height 限位
  function normalizeSvg(el) {
    if (!el) return;
    const vb = el.viewBox && el.viewBox.baseVal;
    if (vb && vb.width && vb.height) {
      el.setAttribute('width', vb.width);
      el.setAttribute('height', vb.height);
    }
  }

  // 渲染到隐藏容器后取出 svg 字符串
  // 甘特图等图型按容器宽度计算 viewBox，所以容器宽度取预览区实际宽度（图才不会被缩得很小）；
  // 预览区不可见（纯代码模式）时退回默认宽度
  async function renderToSvg(code, id) {
    sandbox.style.width = (viewportEl.clientWidth > 200 ? viewportEl.clientWidth : 1200) + 'px';
    try {
      const { svg } = await mermaid.render(id, code, sandbox);
      return svg;
    } finally {
      sandbox.innerHTML = '';
    }
  }

  async function renderDiagram() {
    const code = codeEl.value;
    if (!code.trim()) {
      outputEl.innerHTML = '';
      fitted = false;          // 清空后重新出图时，重新做一次自适应
      showError('');
      return;
    }
    try {
      outputEl.innerHTML = await renderToSvg(code, 'mmd-' + (++renderSeq));
      normalizeSvg(outputEl.querySelector('svg'));
      if (!fitted) fitView();  // 只在新图入场时自适应，改代码重渲染保留当前视角
      showError('');
    } catch (err) {
      showError('语法错误：\n' + (err && err.message ? err.message : String(err)));
    }
  }

  /* -------- 预览区视角：拖动平移 + 滚轮缩放 -------- */
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 8;
  const WHEEL_SENSITIVITY = 0.0015;   // deltaY -> 缩放倍数，取指数关系滚动才匀
  const PAD = 20;                     // 初始视角四周留白，与旧版预览区内边距一致

  let scale = 1, tx = 0, ty = 0;
  let fitted = false;

  function applyTransform() {
    outputEl.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
  }

  // 初始视角：小图按原始尺寸，大图等比缩到放得下；水平居中、顶部留白
  function fitView() {
    if (!outputEl.querySelector('svg') || !viewportEl.clientWidth) return;  // 预览区不可见时先不定，切回来自适应
    const nw = outputEl.offsetWidth, nh = outputEl.offsetHeight;
    if (!nw || !nh) return;
    scale = Math.min(1, (viewportEl.clientWidth - PAD * 2) / nw);
    tx = (viewportEl.clientWidth - nw * scale) / 2;
    ty = PAD;
    fitted = true;
    applyTransform();
  }

  // 以光标所在点为锚点缩放：该点下的图形位置保持不动
  function zoomAt(clientX, clientY, factor) {
    const rect = viewportEl.getBoundingClientRect();
    const cx = clientX - rect.left, cy = clientY - rect.top;
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
    if (next === scale) return;
    tx = cx - (cx - tx) * (next / scale);
    ty = cy - (cy - ty) * (next / scale);
    scale = next;
    applyTransform();
  }

  viewportEl.addEventListener('wheel', e => {
    if (!outputEl.querySelector('svg')) return;
    e.preventDefault();
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;   // 行模式换算成像素
    zoomAt(e.clientX, e.clientY, Math.exp(-delta * WHEEL_SENSITIVITY));
  }, { passive: false });

  let panning = false, panStartX = 0, panStartY = 0, panBaseX = 0, panBaseY = 0;

  viewportEl.addEventListener('pointerdown', e => {
    if (e.button !== 0 || !outputEl.querySelector('svg')) return;   // 同样不 preventDefault，否则 dblclick 不再触发
    panning = true;
    panStartX = e.clientX; panStartY = e.clientY;
    panBaseX = tx; panBaseY = ty;
    viewportEl.classList.add('dragging');
    viewportEl.setPointerCapture(e.pointerId);
  });

  viewportEl.addEventListener('pointermove', e => {
    if (!panning) return;
    tx = panBaseX + (e.clientX - panStartX);
    ty = panBaseY + (e.clientY - panStartY);
    applyTransform();
  });

  function endPan(e) {
    if (!panning) return;
    panning = false;
    viewportEl.classList.remove('dragging');
    if (viewportEl.hasPointerCapture(e.pointerId)) viewportEl.releasePointerCapture(e.pointerId);
  }

  viewportEl.addEventListener('pointerup', endPan);
  viewportEl.addEventListener('pointercancel', endPan);

  // 双击预览区回到初始视角
  viewportEl.addEventListener('dblclick', fitView);

  /* 输入防抖 */
  let debounceTimer = null;
  codeEl.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(renderDiagram, 250);
  });

  /* Tab 键缩进 */
  codeEl.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const s = codeEl.selectionStart, en = codeEl.selectionEnd;
    codeEl.value = codeEl.value.slice(0, s) + '  ' + codeEl.value.slice(en);
    codeEl.selectionStart = codeEl.selectionEnd = s + 2;
  });

  themeSel.addEventListener('change', () => {
    initMermaid(themeSel.value);
    renderDiagram();
  });

  /* -------- 视图模式：代码 / 分屏 / 预览 -------- */
  const modeSwitch = document.getElementById('mode-switch');

  function setMode(mode) {
    document.body.dataset.mode = mode;
    modeSwitch.querySelectorAll('button[data-mode]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    // 纯代码模式下预览区宽度为 0、出图时做不了自适应，切回可见模式时补做一次
    if (mode !== 'code' && !fitted) fitView();
  }

  modeSwitch.addEventListener('click', e => {
    const btn = e.target.closest('button[data-mode]');
    if (btn) setMode(btn.dataset.mode);
  });

  /* -------- 分割线拖拽 -------- */
  const mainEl   = document.querySelector('main');
  const splitter = document.getElementById('splitter');

  const DEFAULT_RATIO = 42;   // 代码区占 main 宽度的百分比
  const MIN_RATIO = 20;
  const MAX_RATIO = 80;
  const LS_KEY = 'mermaid.splitRatio';

  let ratio = DEFAULT_RATIO;

  function applyRatio(p) {
    ratio = Math.min(MAX_RATIO, Math.max(MIN_RATIO, p));
    mainEl.style.setProperty('--editor-w', ratio + '%');
  }

  // 以 file:// 打开时部分浏览器访问 localStorage 会抛异常，读写一律兜底
  function saveRatio() {
    try { localStorage.setItem(LS_KEY, String(ratio)); } catch (e) { /* 忽略 */ }
  }

  function loadRatio() {
    try {
      const v = parseFloat(localStorage.getItem(LS_KEY));
      if (Number.isFinite(v)) applyRatio(v);
    } catch (e) { /* 忽略 */ }
  }

  let dragging = false;

  // 用 pointer 事件 + 指针捕获，拖动经过 textarea / svg 时不会丢事件
  splitter.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;   // 此处不 preventDefault，否则 dblclick 不再触发
    dragging = true;
    splitter.classList.add('dragging');
    document.body.classList.add('resizing');
    splitter.setPointerCapture(e.pointerId);
  });

  splitter.addEventListener('pointermove', e => {
    if (!dragging) return;
    const rect = mainEl.getBoundingClientRect();
    applyRatio((e.clientX - rect.left) / rect.width * 100);
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    splitter.classList.remove('dragging');
    document.body.classList.remove('resizing');
    if (splitter.hasPointerCapture(e.pointerId)) splitter.releasePointerCapture(e.pointerId);
    saveRatio();
  }

  splitter.addEventListener('pointerup', endDrag);
  splitter.addEventListener('pointercancel', endDrag);

  // 双击分割线恢复默认比例
  splitter.addEventListener('dblclick', () => {
    applyRatio(DEFAULT_RATIO);
    saveRatio();
  });

  /* ---------------- 模板选择对话框 ---------------- */
  const templateModal = document.getElementById('templateModal');
  const templateGrid  = document.getElementById('templateGrid');
  const closeModalBtn = document.getElementById('closeModal');

  // 缩略图缓存：模板 id -> svg 字符串，二次打开无需重新渲染
  const thumbCache = new Map();

  function showTemplateModal() {
    renderTemplateCards();
    templateModal.classList.add('active');
    renderThumbnails();
  }

  function hideTemplateModal() {
    templateModal.classList.remove('active');
  }

  function renderTemplateCards() {
    templateGrid.innerHTML = MERMAID_TEMPLATES.map(t => `
      <div class="template-card" data-id="${t.id}">
        <div class="template-preview" data-preview="${t.id}"></div>
        <span class="template-icon">${t.icon}</span>
        <h4 class="template-title">${t.title}</h4>
        <p class="template-desc">${t.description}</p>
        <span class="template-tag">${t.syntax}</span>
      </div>
    `).join('');
  }

  // 按当前 DOM 里的卡片回填缩略图；卡片已被重绘时静默跳过
  function fillThumb(id, svg) {
    const box = templateGrid.querySelector('[data-preview="' + id + '"]');
    if (!box) return;
    box.innerHTML = svg;
    normalizeSvg(box.querySelector('svg'));
  }

  // mermaid 内部串行渲染，这里逐张出图；失败只影响该张卡片
  async function renderThumbnails() {
    for (const t of MERMAID_TEMPLATES) {
      if (thumbCache.has(t.id)) { fillThumb(t.id, thumbCache.get(t.id)); continue; }
      try {
        const svg = await renderToSvg(t.code, 'thumb-' + t.id + '-' + (++renderSeq));
        thumbCache.set(t.id, svg);
        fillThumb(t.id, svg);
      } catch (e) {
        fillThumb(t.id, '<div class="template-preview-failed">预览失败</div>');
      }
    }
  }

  function loadTemplate(template) {
    if (codeEl.value !== lastLoadedCode &&
        !confirm('载入「' + template.title + '」模板将覆盖当前代码，确定继续？')) {
      return;
    }
    codeEl.value = template.code;
    codeEl.scrollTop = 0;
    lastLoadedCode = template.code;
    renderDiagram();
    hideTemplateModal();
  }

  document.getElementById('btn-template').addEventListener('click', showTemplateModal);
  closeModalBtn.addEventListener('click', hideTemplateModal);

  // 卡片点击：事件委托，卡片重绘后无需重新绑定
  templateGrid.addEventListener('click', e => {
    const card = e.target.closest('.template-card');
    if (!card) return;
    const template = MERMAID_TEMPLATES.find(t => t.id === card.dataset.id);
    if (template) loadTemplate(template);
  });

  // 点击遮罩层关闭
  templateModal.addEventListener('click', e => {
    if (e.target === templateModal) hideTemplateModal();
  });

  // ESC 键关闭
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && templateModal.classList.contains('active')) hideTemplateModal();
  });

  /* ---------------- 导出核心工具 ---------------- */

  // 把当前 SVG 克隆、补全属性并加白底，返回序列化字符串和尺寸
  function buildSvgString(svgEl) {
    const clone = svgEl.cloneNode(true);
    const vb    = svgEl.viewBox && svgEl.viewBox.baseVal;
    const rect  = svgEl.getBoundingClientRect();

    const w = (vb && vb.width)  || rect.width  || 800;
    const h = (vb && vb.height) || rect.height || 600;

    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    clone.setAttribute('width', String(w));
    clone.setAttribute('height', String(h));
    clone.style.maxWidth = 'none';
    clone.style.background = '#ffffff';

    // 白色背景矩形，避免 PNG/PDF 透明
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    if (vb && vb.width && vb.height) {
      bg.setAttribute('x', vb.x);
      bg.setAttribute('y', vb.y);
      bg.setAttribute('width', vb.width);
      bg.setAttribute('height', vb.height);
    } else {
      bg.setAttribute('x', 0);
      bg.setAttribute('y', 0);
      bg.setAttribute('width', '100%');
      bg.setAttribute('height', '100%');
    }
    bg.setAttribute('fill', '#ffffff');
    clone.insertBefore(bg, clone.firstChild);

    return { svg: new XMLSerializer().serializeToString(clone), w, h };
  }

  function currentSvg() {
    const el = outputEl.querySelector('svg');
    if (!el) throw new Error('当前没有可导出的图形');
    return el;
  }

  // 支持中文的 base64 编码
  function b64EncodeUnicode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(bin);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload  = () => resolve(img);
      img.onerror = () => reject(new Error('SVG 转图片失败'));
      img.src = src;
    });
  }

  async function makePngDataUrl(scale) {
    const { svg, w, h } = buildSvgString(currentSvg());
    const img = await loadImage('data:image/svg+xml;base64,' + b64EncodeUnicode(svg));

    const canvas = document.createElement('canvas');
    canvas.width  = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return { dataUrl: canvas.toDataURL('image/png'), w, h };
  }

  function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function dataUrlToBlob(dataUrl) {
    const idx  = dataUrl.indexOf(',');
    const head = dataUrl.slice(0, idx);
    const body = dataUrl.slice(idx + 1);
    const mime = head.match(/:(.*?);/)[1];
    const bin  = atob(body);
    const arr  = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  async function runExport(btnId, fn) {
    const btn = document.getElementById(btnId);
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = '导出中…';
    try {
      await fn();
    } catch (e) {
      alert('导出失败：' + (e && e.message ? e.message : e));
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  }

  /* ---------------- 三个下载按钮 ---------------- */

  // SVG
  document.getElementById('btn-svg').addEventListener('click', () => {
    runExport('btn-svg', () => {
      const { svg } = buildSvgString(currentSvg());
      saveBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), 'mermaid-diagram.svg');
    });
  });

  // PNG（2 倍分辨率）
  document.getElementById('btn-png').addEventListener('click', () => {
    runExport('btn-png', async () => {
      const { dataUrl } = await makePngDataUrl(2);
      saveBlob(dataUrlToBlob(dataUrl), 'mermaid-diagram.png');
    });
  });

  // PDF
  document.getElementById('btn-pdf').addEventListener('click', () => {
    runExport('btn-pdf', async () => {
      const { jsPDF } = window.jspdf;
      const { dataUrl, w, h } = await makePngDataUrl(2);

      const pdf = new jsPDF({
        unit: 'pt',
        format: [w, h],
        orientation: w > h ? 'landscape' : 'portrait'
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
      pdf.save('mermaid-diagram.pdf');
    });
  });

  /* ---------------- 启动 ---------------- */
  setMode('split');
  loadRatio();
  initMermaid('default');
  renderDiagram();

})();
