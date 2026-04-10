(function(){
  "use strict";

  // ---------- 等待 pinyin-pro 库加载完成 ----------
  // pinyinPro 挂载在 window 上 (通过本地文件引入)
  
  function initApp() {
    const { pinyin } = window.pinyinPro || {};

    // 健壮性检查:若库加载失败,给出友好提示
    if (!pinyin) {
      alert("拼音库加载失败,请刷新页面或检查网络。");
      console.error("pinyin-pro 未正确加载");
      console.error("window.pinyinPro:", window.pinyinPro);
      return;
    }

    console.log("✓ pinyin-pro 库加载成功");
    console.log("pinyin:", typeof pinyin);

  // ---------- DOM 元素 ----------
  const chineseInput = document.getElementById('chineseInput');
  const toPinyinBtn = document.getElementById('toPinyinBtn');
  const copyPinyinBtn = document.getElementById('copyPinyinBtn');
  const clearChineseBtn = document.getElementById('clearChineseBtn');
  const pinyinResultDiv = document.getElementById('pinyinResult');

  // ---------- 辅助函数:汉字 → 拼音(带声调 Unicode)----------
  function convertChineseToPinyin(text) {
    if (!text || text.trim() === '') {
      return '✨ 请输入一些中文';
    }
    try {
      // 使用 pinyinPro.pinyin,配置输出带声调的 unicode,保留非中文字符
      // nonZh: 'consecutive' 让连续非中文作为一个整体,标点数字原样保留
      const result = pinyin(text, {
        toneType: "unicode",      // 输出如 nǐ hǎo
        nonZh: "consecutive",     // 非中文字符连续输出,不额外加空格
        mode: "normal",           // 普通模式,兼顾多音字
        type: "string"            // 直接返回字符串
      });
      // 处理可能的多余空格(库本身会合理分隔)
      return result || '(无拼音结果)';
    } catch (e) {
      console.warn("拼音转换出错", e);
      return '⚠️ 转换异常,请检查输入';
    }
  }

  // ---------- 渲染拼音结果 ----------
  function renderPinyinResult() {
    const inputText = chineseInput.value;
    const pinyinText = convertChineseToPinyin(inputText);
    pinyinResultDiv.textContent = pinyinText;
  }

  // ---------- 事件绑定 & 初始化 ----------

  // 汉字转拼音
  toPinyinBtn.addEventListener('click', () => {
    renderPinyinResult();
  });

  // 复制拼音结果
  copyPinyinBtn.addEventListener('click', async () => {
    const textToCopy = pinyinResultDiv.textContent;
    if (!textToCopy || textToCopy.includes('请输入')) {
      alert('没有可复制的拼音结果');
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      // 简单反馈(可做tooltip,这里用alert但较轻量)
      const originalText = copyPinyinBtn.textContent;
      copyPinyinBtn.textContent = '✅ 已复制';
      setTimeout(() => copyPinyinBtn.textContent = originalText, 1000);
    } catch (err) {
      alert('复制失败,可手动复制');
    }
  });

  // 清空输入框
  clearChineseBtn.addEventListener('click', () => {
    chineseInput.value = '';
    pinyinResultDiv.textContent = '✨ 等待输入';
  });

  // 页面加载时执行一次默认渲染(让示例显示正确拼音)
  renderPinyinResult();

  // ---------- 附加说明:展示已知限制 & 扩展建议(已在底部footer呈现,此处补充代码注释)----------
  // 1. 多音字准确率:使用 pinyin-pro 内置词典,常见多音字效果良好,但特殊语境可能偏差。
  // 2. 后续扩展:可引入自定义词典 (pinyinPro.addDict) 提高专有名词准确率;增加声调播放;导出为文本等。

    console.log("✓ 应用初始化完成");
  }

  // 确保在 DOM 和库都准备好后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    // DOM 已经准备好,直接初始化
    initApp();
  }
})();
