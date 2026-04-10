(function(){
  "use strict";

  // ---------- DOM 元素 ----------
  const qCountInput = document.getElementById('questionCount');
  const minValInput = document.getElementById('minValue');
  const maxValInput = document.getElementById('maxValue');
  const chkAdd = document.getElementById('useAdd');
  const chkSub = document.getElementById('useSub');
  const chkMul = document.getElementById('useMul');
  const chkDiv = document.getElementById('useDiv');
  const chkAllowNegative = document.getElementById('allowNegative');
  const chkAllowDecimal = document.getElementById('allowDecimal');
  const generateBtn = document.getElementById('generateBtn');
  const questionList = document.getElementById('questionList');
  const answerList = document.getElementById('answerList');
  const toggleAnswerBtn = document.getElementById('toggleAnswerBtn');
  const hideAnswerInlineBtn = document.getElementById('hideAnswerInlineBtn');
  const printPaperBtn = document.getElementById('printPaperBtn');
  const printAnswerBtn = document.getElementById('printAnswerBtn');
  const answerPanel = document.getElementById('answerPanel');

  let currentQuestions = [];  // { text, answer }

  // ---------- 辅助函数：安全随机整数 ----------
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ---------- 生成可能带小数的数值 ----------
  function getRandomNumber(min, max, allowDecimal) {
    if (!allowDecimal) return getRandomInt(min, max);
    // 70%概率生成小数（1~2位）
    if (Math.random() > 0.7) return getRandomInt(min, max);
    const precision = Math.random() > 0.5 ? 1 : 2;
    const factor = Math.pow(10, precision);
    const intMin = Math.ceil(min * factor);
    const intMax = Math.floor(max * factor);
    if (intMin > intMax) return getRandomInt(min, max);
    const val = getRandomInt(intMin, intMax) / factor;
    return Math.round(val * factor) / factor;
  }

  // 格式化显示数字
  function formatNumber(n) {
    if (typeof n !== 'number' || isNaN(n)) return '0';
    // 避免浮点误差，保留适当小数
    return parseFloat(n.toFixed(5)).toString();
  }

  // ---------- 生成单题（核心） ----------
  function generateSingleQuestion(ops, min, max, allowNeg, allowDec) {
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer, text;
    const maxAttempts = 300;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        switch (op) {
          case '+':
            a = getRandomNumber(min, max, allowDec);
            b = getRandomNumber(min, max, allowDec);
            answer = a + b;
            break;
          case '-':
            a = getRandomNumber(min, max, allowDec);
            b = getRandomNumber(min, max, allowDec);
            if (!allowNeg && a < b) [a, b] = [b, a]; // 确保非负
            answer = a - b;
            break;
          case '*':
            a = getRandomNumber(min, max, allowDec);
            b = getRandomNumber(min, max, allowDec);
            answer = a * b;
            // 防止乘积过大溢出范围（但保留）
            if (Math.abs(answer) > max * max) continue;
            break;
          case '÷':
            // 除法强制整数整除
            const divisor = getRandomInt(Math.max(1, Math.floor(min)), Math.max(1, Math.floor(max)));
            if (divisor === 0) continue;
            const quotientMin = Math.ceil(min / divisor);
            const quotientMax = Math.floor(max / divisor);
            if (quotientMin > quotientMax) continue;
            const quotient = getRandomInt(quotientMin, quotientMax);
            a = divisor * quotient;
            b = divisor;
            answer = quotient;
            break;
          default: continue;
        }

        // 边界检查
        if (a < min || a > max || b < min || b > max) continue;

        // 答案精度处理
        answer = Math.round(answer * 100000) / 100000;

        // 构造文本
        const aStr = formatNumber(a);
        const bStr = formatNumber(b);
        let opSymbol = op;
        if (op === '*') opSymbol = '×';
        if (op === '÷') opSymbol = '÷';
        text = `${aStr} ${opSymbol} ${bStr} =`;

        return { text, answer };
      } catch (e) {
        continue;
      }
    }

    // 保底题目（极少数情况）
    const safeA = getRandomInt(min, max);
    const safeB = getRandomInt(min, max);
    return { text: `${safeA} + ${safeB} =`, answer: safeA + safeB };
  }

  // ---------- 生成整套试卷（含去重） ----------
  function generatePaper() {
    try {
      // 读取并清洗参数
      let count = parseInt(qCountInput.value, 10);
      if (isNaN(count) || count < 1) count = 20;

      let min = parseFloat(minValInput.value);
      let max = parseFloat(maxValInput.value);
      if (isNaN(min)) min = 1;
      if (isNaN(max)) max = 100;
      if (min >= max) {
        alert('最小值必须小于最大值，已自动调整为合理范围。');
        min = Math.min(min, max - 1);
        max = Math.max(min + 1, max);
        minValInput.value = min;
        maxValInput.value = max;
      }

      const selectedOps = [];
      if (chkAdd.checked) selectedOps.push('+');
      if (chkSub.checked) selectedOps.push('-');
      if (chkMul.checked) selectedOps.push('*');
      if (chkDiv.checked) selectedOps.push('÷');
      if (selectedOps.length === 0) {
        alert('请至少选择一种运算类型。');
        return;
      }

      const allowNeg = chkAllowNegative.checked;
      const allowDec = chkAllowDecimal.checked;

      const questions = [];
      const expressionSet = new Set();
      const maxTotalAttempts = count * 50 + 300;

      for (let i = 0; i < count; i++) {
        let attempts = 0;
        let added = false;
        while (attempts < maxTotalAttempts) {
          const q = generateSingleQuestion(selectedOps, min, max, allowNeg, allowDec);
          if (!expressionSet.has(q.text)) {
            expressionSet.add(q.text);
            questions.push(q);
            added = true;
            break;
          }
          attempts++;
        }
        if (!added) {
          // 实在无法生成不重复题目，补一个简单加法（微调避免重复）
          let fallbackA = getRandomInt(min, max);
          let fallbackB = getRandomInt(min, max);
          let fallbackText = `${fallbackA} + ${fallbackB} =`;
          while (expressionSet.has(fallbackText)) {
            fallbackA = getRandomInt(min, max);
            fallbackB = getRandomInt(min, max);
            fallbackText = `${fallbackA} + ${fallbackB} =`;
          }
          questions.push({ text: fallbackText, answer: fallbackA + fallbackB });
          expressionSet.add(fallbackText);
        }
      }

      currentQuestions = questions.slice(0, count);
      renderQuizAndAnswers();
    } catch (error) {
      alert('生成试卷时出错：' + error.message);
      console.error(error);
    }
  }

  // ---------- 渲染界面 ----------
  function renderQuizAndAnswers() {
    if (!currentQuestions.length) {
      questionList.innerHTML = '<li class="empty-msg">✨ 点击生成试卷</li>';
      answerList.innerHTML = '<li class="empty-msg">— 暂无答案 —</li>';
      return;
    }

    // 渲染题目
    let quizHtml = '';
    currentQuestions.forEach(q => {
      quizHtml += `<li class="question-item"><span class="question-text">${q.text} <span class="answer-blank"></span></span></li>`;
    });
    questionList.innerHTML = quizHtml;

    // 渲染答案
    let ansHtml = '';
    currentQuestions.forEach((q, index) => {
      ansHtml += `<li class="answer-item"><span class="answer-value">${q.answer}</span></li>`;
    });
    answerList.innerHTML = ansHtml;

    // 确保答案面板可见
    if (answerPanel.classList.contains('answer-hidden')) {
      answerPanel.classList.remove('answer-hidden');
      toggleAnswerBtn.textContent = '🙈 隐藏答案';
    }
  }

  // ---------- 显示/隐藏答案 ----------
  function toggleAnswerVisibility(force) {
    if (typeof force === 'boolean') {
      if (force) answerPanel.classList.remove('answer-hidden');
      else answerPanel.classList.add('answer-hidden');
    } else {
      answerPanel.classList.toggle('answer-hidden');
    }
    const hidden = answerPanel.classList.contains('answer-hidden');
    toggleAnswerBtn.textContent = hidden ? '👀 显示答案' : '🙈 隐藏答案';
  }

  // ---------- 打印控制 ----------
  function printWithMode(mode) {
    const bodyClass = mode === 'paper' ? 'print-paper' : 'print-answer';
    document.body.classList.add(bodyClass);

    window.print();

    const afterPrint = () => {
      document.body.classList.remove('print-paper', 'print-answer');
      window.removeEventListener('afterprint', afterPrint);
    };
    window.addEventListener('afterprint', afterPrint);
    setTimeout(() => {
      document.body.classList.remove('print-paper', 'print-answer');
    }, 500);
  }

  // ---------- 事件绑定（带错误提示）----------
  function bindEvents() {
    generateBtn.addEventListener('click', (e) => {
      try {
        generatePaper();
      } catch (err) {
        alert('生成失败：' + err.message);
      }
    });

    toggleAnswerBtn.addEventListener('click', () => toggleAnswerVisibility());
    hideAnswerInlineBtn.addEventListener('click', () => toggleAnswerVisibility());

    printPaperBtn.addEventListener('click', () => {
      if (currentQuestions.length === 0) {
        alert('请先生成试卷');
        return;
      }
      printWithMode('paper');
    });

    printAnswerBtn.addEventListener('click', () => {
      if (currentQuestions.length === 0) {
        alert('暂无答案可打印');
        return;
      }
      printWithMode('answer');
    });

    // 输入值联动校验
    minValInput.addEventListener('change', function() {
      const min = parseFloat(this.value);
      const max = parseFloat(maxValInput.value);
      if (!isNaN(min) && !isNaN(max) && min >= max) {
        maxValInput.value = min + 1;
      }
    });
    maxValInput.addEventListener('change', function() {
      const min = parseFloat(minValInput.value);
      const max = parseFloat(this.value);
      if (!isNaN(min) && !isNaN(max) && min >= max) {
        minValInput.value = Math.max(0, max - 1);
      }
    });
  }

  // 默认生成一份试卷
  function initDefault() {
    try {
      generatePaper();
    } catch (e) {
      console.warn('初始生成失败，但页面已就绪。', e);
    }
  }

  bindEvents();
  initDefault();
})();
