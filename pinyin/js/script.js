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
  // 左侧:汉字转拼音
  const chineseInput = document.getElementById('chineseInput');
  const toPinyinBtn = document.getElementById('toPinyinBtn');
  const copyPinyinBtn = document.getElementById('copyPinyinBtn');
  const clearChineseBtn = document.getElementById('clearChineseBtn');
  const pinyinResultDiv = document.getElementById('pinyinResult');

  // 右侧:拼音转汉字
  const pinyinInput = document.getElementById('pinyinInput');
  const toHanziBtn = document.getElementById('toHanziBtn');
  const copyCandidateBtn = document.getElementById('copyCandidateBtn');
  const clearPinyinBtn = document.getElementById('clearPinyinBtn');
  const candidateResultDiv = document.getElementById('candidateResult');

  // 存储当前右侧生成的首选词 (用于复制)
  let currentTopCandidate = '';

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

  // ---------- 拼音 → 汉字(使用内置简单映射表)----------
  // 注意: pinyin-pro 库不提供 pinyinToHan 功能
  // 这里使用一个简单的拼音到汉字的映射表作为示例
  const pinyinToHanziMap = {
    'nǐ': ['你', '尼', '拟', '逆', '腻'],
    'hǎo': ['好', '号', '耗', '浩', '豪'],
    'zhōng': ['中', '忠', '钟', '终', '肿'],
    'guó': ['国', '果', '过', '锅', '郭'],
    'nǐ hǎo': ['你好', '你号', '尼好', '拟好'],
    'zhōng guó': ['中国']
  };

  function convertPinyinToCandidates(pinyinStr) {
    if (!pinyinStr || pinyinStr.trim() === '') {
      return { candidates: [], topWord: '', error: '请输入拼音' };
    }
    
    try {
      const normalizedPinyin = pinyinStr.trim().toLowerCase();
      
      // 首先尝试完整匹配
      if (pinyinToHanziMap[normalizedPinyin]) {
        const candidates = pinyinToHanziMap[normalizedPinyin];
        return { 
          candidates: candidates.slice(0, 5), 
          topWord: candidates[0], 
          error: null 
        };
      }
      
      // 尝试分音节匹配
      const syllables = normalizedPinyin.split(/\s+/);
      if (syllables.length > 1) {
        // 多音节：尝试组合
        let allCandidates = [];
        for (let i = 0; i < syllables.length; i++) {
          const syl = syllables[i];
          if (pinyinToHanziMap[syl]) {
            allCandidates.push(pinyinToHanziMap[syl]);
          } else {
            // 如果没有找到该音节的映射，返回空
            return { 
              candidates: [], 
              topWord: '', 
              error: `未找到拼音 "${syl}" 对应的汉字` 
            };
          }
        }
        
        // 生成组合（笛卡尔积）
        if (allCandidates.length > 0) {
          const combinations = generateWordCombinations(allCandidates, 8);
          const topFive = combinations.slice(0, 5);
          return { 
            candidates: topFive, 
            topWord: topFive[0] || '', 
            error: null 
          };
        }
      }
      
      // 单音节查找
      if (syllables.length === 1 && pinyinToHanziMap[syllables[0]]) {
        const candidates = pinyinToHanziMap[syllables[0]];
        return { 
          candidates: candidates.slice(0, 5), 
          topWord: candidates[0], 
          error: null 
        };
      }
      
      return { 
        candidates: [], 
        topWord: '', 
        error: '未找到对应汉字，请检查拼音格式' 
      };
    } catch (e) {
      console.warn("拼音转汉字出错", e);
      return { candidates: [], topWord: '', error: '转换失败,请检查拼音格式' };
    }
  }

  // 笛卡尔积生成词语 (限制最大数量)
  function generateWordCombinations(syllableArrays, maxCount = 8) {
    if (!syllableArrays.length) return [];

    // 如果只有一个音节,直接返回该音节的候选字(但显示为单字列表)
    if (syllableArrays.length === 1) {
      return syllableArrays[0].slice(0, maxCount);
    }

    // 多音节:递归生成组合
    let results = [];

    function helper(currentIndex, currentWord) {
      if (results.length >= maxCount) return;
      if (currentIndex === syllableArrays.length) {
        results.push(currentWord);
        return;
      }
      const choices = syllableArrays[currentIndex];
      for (let char of choices) {
        helper(currentIndex + 1, currentWord + char);
        if (results.length >= maxCount) break;
      }
    }

    helper(0, '');
    return results;
  }

  // ---------- 渲染拼音结果 ----------
  function renderPinyinResult() {
    const inputText = chineseInput.value;
    const pinyinText = convertChineseToPinyin(inputText);
    pinyinResultDiv.textContent = pinyinText;
  }

  // ---------- 渲染候选词结果 ----------
  function renderCandidateResult() {
    const rawPinyin = pinyinInput.value;
    const { candidates, topWord, error } = convertPinyinToCandidates(rawPinyin);

    // 清空并重新填充
    candidateResultDiv.innerHTML = '';

    if (error) {
      const errorSpan = document.createElement('span');
      errorSpan.className = 'error-message';
      errorSpan.textContent = `⚠️ ${error}`;
      candidateResultDiv.appendChild(errorSpan);
      currentTopCandidate = '';
      return;
    }

    if (candidates.length === 0) {
      const emptyMsg = document.createElement('span');
      emptyMsg.className = 'hint-note';
      emptyMsg.style.marginTop = '0';
      emptyMsg.textContent = '没有找到候选词,尝试其他拼音';
      candidateResultDiv.appendChild(emptyMsg);
      currentTopCandidate = '';
      return;
    }

    // 生成chip元素
    candidates.forEach(word => {
      const chip = document.createElement('span');
      chip.className = 'candidate-chip';
      chip.textContent = word;
      candidateResultDiv.appendChild(chip);
    });

    // 更新首选词(第一个候选)
    currentTopCandidate = candidates[0] || '';

    // 附加提示信息(如果是单字)
    if (candidates.length > 0 && candidates[0].length === 1 && rawPinyin.trim().split(/\s+/).length === 1) {
      const hint = document.createElement('div');
      hint.className = 'hint-note';
      hint.style.marginTop = '12px';
      hint.style.width = '100%';
      hint.textContent = '📌 单字候选,点击复制将复制第一个字';
      candidateResultDiv.appendChild(hint);
    }
  }

  // ---------- 事件绑定 & 初始化 ----------

  // 左侧:汉字转拼音
  toPinyinBtn.addEventListener('click', () => {
    renderPinyinResult();
  });

  // 右侧:拼音转汉字
  toHanziBtn.addEventListener('click', () => {
    renderCandidateResult();
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

  // 复制候选首选词
  copyCandidateBtn.addEventListener('click', async () => {
    if (!currentTopCandidate) {
      // 尝试重新获取当前显示的第一个chip文字
      const firstChip = candidateResultDiv.querySelector('.candidate-chip');
      if (firstChip) {
        currentTopCandidate = firstChip.textContent;
      } else {
        alert('没有候选词可复制');
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(currentTopCandidate);
      const originalText = copyCandidateBtn.textContent;
      copyCandidateBtn.textContent = '✅ 已复制';
      setTimeout(() => copyCandidateBtn.textContent = originalText, 1000);
    } catch (err) {
      alert('复制失败');
    }
  });

  // 清空左侧输入框
  clearChineseBtn.addEventListener('click', () => {
    chineseInput.value = '';
    pinyinResultDiv.textContent = '✨ 等待输入';
    // 可选重置默认示例?不清空也可以
  });

  // 清空右侧输入框
  clearPinyinBtn.addEventListener('click', () => {
    pinyinInput.value = '';
    candidateResultDiv.innerHTML = '<span class="candidate-chip">等待输入</span>';
    currentTopCandidate = '';
  });

  // 页面加载时执行一次默认渲染(让示例显示正确拼音)
  renderPinyinResult();
  renderCandidateResult();

  // 附加:如果用户希望按回车快速转换?可选,不做强制。
  // 但提供更友好的体验:右侧拼音输入框支持回车触发转换
  pinyinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      renderCandidateResult();
    }
  });
  chineseInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {  // Ctrl+Enter 转换,避免误触
      e.preventDefault();
      renderPinyinResult();
    }
  });

  // ---------- 附加说明:展示已知限制 & 扩展建议(已在底部footer呈现,此处补充代码注释)----------
  // 1. 多音字准确率:使用 pinyin-pro 内置词典,常见多音字效果良好,但特殊语境可能偏差。
  // 2. 拼音转汉字:因同音词极多,仅展示前5个高频组合,复杂句子建议使用专业输入法。
  // 3. 后续扩展:可引入自定义词典 (pinyinPro.addDict) 提高专有名词准确率;增加声调播放;导出为文本等。

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
