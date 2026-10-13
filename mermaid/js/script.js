(function () {
  'use strict';

  const codeEl   = document.getElementById('code');
  const outputEl = document.getElementById('output');
  const errorEl  = document.getElementById('error');
  const themeSel = document.getElementById('theme');

  /* ---------------- 默认示例 ---------------- */
  codeEl.value = [
    'graph TD',
    '  A[开始] --> B{用户已登录?}',
    '  B -- 是 --> C[进入首页]',
    '  B -- 否 --> D[跳转登录页]',
    '  D --> E[输入账号密码]',
    '  E --> C',
    '  C --> F([结束])'
  ].join('\n');

  /* -------- 隐藏容器：承接 mermaid 渲染时的临时 DOM -------- */
  const sandbox = document.createElement('div');
  sandbox.style.cssText = 'position:absolute;left:-9999px;top:0;width:0;height:0;overflow:hidden;';
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

  async function renderDiagram() {
    const code = codeEl.value;
    if (!code.trim()) {
      outputEl.innerHTML = '';
      showError('');
      return;
    }
    const id = 'mmd-' + (++renderSeq);
    try {
      const { svg } = await mermaid.render(id, code, sandbox);
      outputEl.innerHTML = svg;

      // 让图自适应预览区宽度
      const el = outputEl.querySelector('svg');
      if (el) {
        el.removeAttribute('height');
        el.style.maxWidth = '100%';
        el.style.height = 'auto';
      }
      showError('');
    } catch (err) {
      showError('语法错误：\n' + (err && err.message ? err.message : String(err)));
    } finally {
      sandbox.innerHTML = '';
    }
  }

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
  initMermaid('default');
  renderDiagram();

})();
