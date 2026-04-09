// DOM 元素
const timerDisplay = document.getElementById('timerDisplay');
const progressFill = document.getElementById('progressFill');
const hoursInput = document.getElementById('hoursInput');
const minutesInput = document.getElementById('minutesInput');
const secondsInput = document.getElementById('secondsInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const presetBtns = document.querySelectorAll('.preset-btn');
const toastMsgDiv = document.getElementById('toastMsg');

// 核心变量 (毫秒)
let remainingMs = 0;
let totalMs = 0;
let isRunning = false;
let animationId = null;
let startTimestamp = 0;
let startRemainingMs = 0;

// ---------- 辅助函数 ----------
function showToast(message = '⏰ 时间到啦！', duration = 2200) {
    toastMsgDiv.textContent = message;
    toastMsgDiv.classList.add('show');
    setTimeout(() => {
        toastMsgDiv.classList.remove('show');
    }, duration);
}

function blinkVisualAlert() {
    const card = document.querySelector('.timer-card');
    if (!card) return;
    card.style.transition = 'box-shadow 0.08s ease';
    card.style.boxShadow = '0 0 0 2px #facc15, 0 0 0 5px #f59e0b80';
    setTimeout(() => {
        card.style.boxShadow = '';
    }, 500);
}

// 统一格式化：始终显示 HH:MM:SS.mmm（截断，不四舍五入）
function formatTimeMs(ms) {
    if (ms < 0) ms = 0;
    // 截断到整数毫秒
    const truncatedMs = Math.floor(ms);
    const totalSeconds = Math.floor(truncatedMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = truncatedMs % 1000;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

function updateUI() {
    timerDisplay.textContent = formatTimeMs(remainingMs);
    let percent = 0;
    if (totalMs > 0) {
        const elapsed = totalMs - remainingMs;
        percent = (elapsed / totalMs) * 100;
        if (percent > 100) percent = 100;
        if (percent < 0) percent = 0;
    } else {
        percent = (remainingMs === 0) ? 100 : 0;
    }
    progressFill.style.width = `${percent}%`;
}

function getTotalMsFromInputs() {
    let hrs = parseInt(hoursInput.value) || 0;
    let mins = parseInt(minutesInput.value) || 0;
    let secs = parseInt(secondsInput.value) || 0;
    hrs = Math.min(99, Math.max(0, hrs));
    mins = Math.min(59, Math.max(0, mins));
    secs = Math.min(59, Math.max(0, secs));
    hoursInput.value = hrs;
    minutesInput.value = mins;
    secondsInput.value = secs;
    return (hrs * 3600 + mins * 60 + secs) * 1000;
}

function setControlsEnabled(enabled) {
    hoursInput.disabled = !enabled;
    minutesInput.disabled = !enabled;
    secondsInput.disabled = !enabled;
    presetBtns.forEach(btn => {
        btn.disabled = !enabled;
    });
}

function updateButtonsState() {
    if (!isRunning && remainingMs > 0) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
    pauseBtn.disabled = !isRunning;
    resetBtn.disabled = false;
}

function stopAnimationLoop() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function handleTimeUp() {
    if (isRunning) {
        stopAnimationLoop();
        isRunning = false;
        remainingMs = 0;
        totalMs = totalMs > 0 ? totalMs : 0;
        updateUI();
        setControlsEnabled(true);
        updateButtonsState();
        
        // 醒目提示：多次闪烁 + 强震动效果
        startBlinkingAlert();
        showToast('🔔 时间到啦！ 🔔', 5000);
        
        // 显示弹窗
        showTimeUpModal();
        
        // 修改标题并持续闪烁
        let titleBlinkCount = 0;
        const originalTitle = document.title;
        const titleInterval = setInterval(() => {
            document.title = titleBlinkCount % 2 === 0 ? '⏰ 时间到啦! ⏰' : originalTitle;
            titleBlinkCount++;
            if (titleBlinkCount >= 10) {
                clearInterval(titleInterval);
                document.title = originalTitle;
            }
        }, 500);
    } else {
        if (remainingMs <= 0) {
            remainingMs = 0;
            updateUI();
        }
    }
}

// 显示倒计时结束弹窗
function showTimeUpModal() {
    const modal = document.getElementById('timeUpModal');
    if (modal) {
        modal.classList.add('show');
        // 播放提示音（如果浏览器支持）
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            // 忽略音频错误
        }
    }
}

// 关闭弹窗
function closeTimeUpModal() {
    const modal = document.getElementById('timeUpModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// 醒目的闪烁提醒效果
let blinkInterval = null;
function startBlinkingAlert() {
    const card = document.querySelector('.timer-card');
    const display = document.querySelector('.countdown-display');
    if (!card || !display) return;
    
    // 清除之前的闪烁
    if (blinkInterval) clearInterval(blinkInterval);
    
    let blinkCount = 0;
    const maxBlinks = 15; // 闪烁15次
    
    blinkInterval = setInterval(() => {
        if (blinkCount >= maxBlinks) {
            clearInterval(blinkInterval);
            card.style.boxShadow = '';
            display.style.background = '#0a0f1c';
            display.style.transform = '';
            return;
        }
        
        const isOn = blinkCount % 2 === 0;
        if (isOn) {
            // 亮起状态 - 强烈红色警告
            card.style.transition = 'all 0.1s ease';
            card.style.boxShadow = '0 0 0 4px #ef4444, 0 0 30px #ef444480, 0 0 60px #ef444440';
            display.style.background = '#1a0a0a';
            display.style.transform = 'scale(1.02)';
        } else {
            // 熄灭状态
            card.style.boxShadow = '0 0 0 2px #facc15, 0 0 15px #f59e0b60';
            display.style.background = '#0a0f1c';
            display.style.transform = 'scale(1)';
        }
        
        blinkCount++;
    }, 200);
}

function animationTick(now) {
    if (!isRunning) {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        return;
    }
    const elapsed = now - startTimestamp;
    let newRemaining = startRemainingMs - elapsed;
    if (newRemaining <= 0) {
        remainingMs = 0;
        updateUI();
        handleTimeUp();
        return;
    }
    remainingMs = newRemaining;
    updateUI();
    animationId = requestAnimationFrame(animationTick);
}

function startTimer() {
    if (isRunning) return;
    if (remainingMs <= 0) {
        showToast('请先设置有效时间或按重置', 1200);
        return;
    }
    stopAnimationLoop();
    startTimestamp = performance.now();
    startRemainingMs = remainingMs;
    isRunning = true;
    setControlsEnabled(false);
    animationId = requestAnimationFrame(animationTick);
    updateButtonsState();
}

function pauseTimer() {
    if (!isRunning) return;
    stopAnimationLoop();
    if (startTimestamp && startRemainingMs > 0) {
        const now = performance.now();
        const elapsed = now - startTimestamp;
        let preciseRemaining = startRemainingMs - elapsed;
        if (preciseRemaining < 0) preciseRemaining = 0;
        remainingMs = preciseRemaining;
        updateUI();
    }
    isRunning = false;
    setControlsEnabled(true);
    updateButtonsState();
    if (remainingMs <= 0) {
        startBtn.disabled = true;
    }
}

function resetTimer() {
    if (isRunning) {
        stopAnimationLoop();
        isRunning = false;
    }
    const newTotalMs = getTotalMsFromInputs();
    totalMs = newTotalMs;
    remainingMs = newTotalMs;
    updateUI();
    setControlsEnabled(true);
    updateButtonsState();
    if (remainingMs === 0) {
        startBtn.disabled = true;
    } else {
        startBtn.disabled = false;
    }
    startTimestamp = 0;
    startRemainingMs = 0;
}

function syncRemainingFromInputs() {
    if (isRunning) return;
    const newTotal = getTotalMsFromInputs();
    totalMs = newTotal;
    remainingMs = newTotal;
    updateUI();
    updateButtonsState();
    if (remainingMs === 0) startBtn.disabled = true;
    else startBtn.disabled = false;
}

function setPresetTime(seconds) {
    if (isRunning) {
        pauseTimer();
    }
    const totalMilli = seconds * 1000;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    hoursInput.value = hrs;
    minutesInput.value = mins;
    secondsInput.value = secs;
    totalMs = totalMilli;
    remainingMs = totalMilli;
    updateUI();
    setControlsEnabled(true);
    updateButtonsState();
    if (remainingMs > 0) startBtn.disabled = false;
    showToast(`已设为 ${formatTimeMs(totalMilli)}`, 1000);
}

function onInputChange() {
    if (isRunning) return;
    let hrs = parseInt(hoursInput.value) || 0;
    let mins = parseInt(minutesInput.value) || 0;
    let secs = parseInt(secondsInput.value) || 0;
    hrs = Math.min(99, Math.max(0, hrs));
    mins = Math.min(59, Math.max(0, mins));
    secs = Math.min(59, Math.max(0, secs));
    hoursInput.value = hrs;
    minutesInput.value = mins;
    secondsInput.value = secs;
    const newTotalMs = (hrs * 3600 + mins * 60 + secs) * 1000;
    totalMs = newTotalMs;
    remainingMs = newTotalMs;
    updateUI();
    updateButtonsState();
    if (remainingMs === 0) startBtn.disabled = true;
    else startBtn.disabled = false;
}

// 空格键控制
function handleSpaceKey(e) {
    if (e.code === 'Space') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            e.preventDefault();
            return;
        }
        e.preventDefault();
        if (isRunning) {
            pauseTimer();
        } else {
            if (remainingMs > 0) {
                startTimer();
            } else {
                showToast('⏳ 时间已归零，请重置或设置时间', 1200);
            }
        }
    }
}

function bindEvents() {
    hoursInput.addEventListener('input', onInputChange);
    minutesInput.addEventListener('input', onInputChange);
    secondsInput.addEventListener('input', onInputChange);
    hoursInput.addEventListener('blur', onInputChange);
    minutesInput.addEventListener('blur', onInputChange);
    secondsInput.addEventListener('blur', onInputChange);
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    presetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const secVal = parseInt(btn.getAttribute('data-seconds'));
            if (!isNaN(secVal) && secVal > 0) {
                setPresetTime(secVal);
            }
        });
    });
    window.addEventListener('keydown', handleSpaceKey);
}

function preventInputWheel() {
    const numberInputs = [hoursInput, minutesInput, secondsInput];
    numberInputs.forEach(inp => {
        inp.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
    });
}

function initialize() {
    hoursInput.value = 0;
    minutesInput.value = 1;
    secondsInput.value = 0;
    const initMs = 60 * 1000;
    totalMs = initMs;
    remainingMs = initMs;
    updateUI();
    setControlsEnabled(true);
    isRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    animationId = null;
    startTimestamp = 0;
    updateButtonsState();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
});

function init() {
    initialize();
    bindEvents();
    preventInputWheel();
}

init();
