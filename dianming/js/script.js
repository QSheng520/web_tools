// ---------- 数据存储 ----------
let students = [];            // 存储姓名数组
let isRolling = false;       // 点名动画是否进行中
let rollInterval = null;     // 定时器ID
const STORAGE_KEY = 'roll_call_students_aoo';

// DOM 元素
const resultNameDiv = document.getElementById('resultName');
const callBtn = document.getElementById('callBtn');
const studentCountSpan = document.getElementById('studentCount');
const studentListContainer = document.getElementById('studentListContainer');
const studentNameInput = document.getElementById('studentNameInput');
const addStudentBtn = document.getElementById('addStudentBtn');
const batchAddBtn = document.getElementById('batchAddBtn');
const resetDefaultBtn = document.getElementById('resetDefaultBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const deleteSelectedAll = document.getElementById('deleteSelectedAll');
const batchNamesInput = document.getElementById('batchNamesInput');

// 默认初始名单 (丰富有趣)
const DEFAULT_STUDENTS = [
    "欧阳若曦", "林清瑶", "周子衡", "唐雨沫", "苏子川",
    "白若溪", "陆一鸣", "宁婉儿", "顾飞羽", "柳梦璃"
];

// 辅助: 保存至localStorage
function saveToLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// 加载本地数据
function loadFromLocal() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length >= 0) {
                students = parsed;
                return;
            }
        } catch(e) { console.warn(e); }
    }
    // 无数据则使用默认
    students = [...DEFAULT_STUDENTS];
    saveToLocal();
}

// 更新界面: 总数, 学生列表渲染
function renderStudentList() {
    // 更新总数
    studentCountSpan.innerText = students.length;

    // 渲染列表容器
    if (!studentListContainer) return;
    if (students.length === 0) {
        studentListContainer.innerHTML = `<div class="empty-list"><i class="fas fa-user-slash"></i> 暂无学生，请添加～</div>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    students.forEach((student, idx) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'student-item';
        itemDiv.innerHTML = `
            <span class="student-name"><i class="fas fa-user-circle" style="color:#f39c12; margin-right:8px;"></i>${escapeHtml(student)}</span>
            <button class="del-student" data-index="${idx}" title="删除 ${escapeHtml(student)}"><i class="fas fa-times-circle"></i></button>
        `;
        fragment.appendChild(itemDiv);
    });
    studentListContainer.innerHTML = '';
    studentListContainer.appendChild(fragment);

    // 绑定每个删除按钮事件 (动态)
    document.querySelectorAll('.del-student').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isRolling) {
                showToast("点名进行中，请稍后再操作", "warning");
                return;
            }
            const indexAttr = btn.getAttribute('data-index');
            if (indexAttr !== null) {
                const idx = parseInt(indexAttr, 10);
                if (!isNaN(idx) && idx >= 0 && idx < students.length) {
                    students.splice(idx, 1);
                    saveToLocal();
                    renderStudentList();
                    // 如果点名结果显示的是被删除的名字且当前没有点名动画，可清空结果或保留原样（无关紧要）
                    const currentName = resultNameDiv.innerText;
                    if (!isRolling && (!students.length || (currentName !== '✨ 待点名 ✨' && !students.includes(currentName)))) {
                        resultNameDiv.innerText = '✨ 待点名 ✨';
                        resultNameDiv.classList.remove('rolling');
                    }
                    showToast(`已移除一名学生`, "info");
                }
            }
        });
    });
}

// 简单的防XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
        return c;
    });
}

// 禁用/启用所有控制组件 (点名动画期间)
function setControlsEnabled(enabled) {
    const btns = [addStudentBtn, batchAddBtn, resetDefaultBtn, clearAllBtn, deleteSelectedAll];
    btns.forEach(btn => {
        if (btn) btn.disabled = !enabled;
    });
    // 单独处理添加input和textarea
    if (studentNameInput) studentNameInput.disabled = !enabled;
    if (batchNamesInput) batchNamesInput.disabled = !enabled;
    // 点名按钮单独禁用逻辑由动画自己控制
    if (callBtn) {
        if (!enabled) callBtn.disabled = true;
        else if (!isRolling) callBtn.disabled = false;
    }
    // 列表中的删除按钮可单独控制: 动态渲染后通过css或属性，但不用管，事件会判断 isRolling 并禁止删除。为了体验，全局disabled让删除按钮看起来可点实际事件会拦截
    // 另外动态删除按钮事件中有flag拦截，不用额外禁用。
}

// 停止点名动画并清理定时器
function stopRollingAndPickFinal(manualStop = false) {
    if (rollInterval) {
        clearInterval(rollInterval);
        rollInterval = null;
    }
    if (isRolling) {
        isRolling = false;
        // 最终从数组中选取一个真实学生
        if (students.length > 0) {
            const randomIndex = Math.floor(Math.random() * students.length);
            const finalName = students[randomIndex];
            resultNameDiv.innerText = finalName;
            resultNameDiv.classList.remove('rolling');
            // 加点炫光瞬间效果
            resultNameDiv.style.transform = 'scale(1.02)';
            setTimeout(() => { if(resultNameDiv) resultNameDiv.style.transform = ''; }, 200);
            // 可选轻微的提示音效果感（无声音只是视觉反馈）
            showToast(`✨ 点到：${finalName} ✨`, "success");
        } else {
            resultNameDiv.innerText = '⚠️ 无学生';
            resultNameDiv.classList.remove('rolling');
            showToast("名单为空，请先添加学生", "error");
        }
        // 恢复所有控件
        setControlsEnabled(true);
        // 点名按钮恢复启用
        if (callBtn) callBtn.disabled = false;
    }
}

// 开始点名动画（随机闪烁）
function startRollCall() {
    if (isRolling) {
        // 如果正在点名，再点击直接停止并出结果
        stopRollingAndPickFinal(true);
        return;
    }
    if (students.length === 0) {
        showToast("学生名单为空！请先添加学生~", "error");
        return;
    }

    // 开始点名流程
    isRolling = true;
    // 禁用所有操作按钮
    setControlsEnabled(false);
    callBtn.disabled = false;  // 点名按钮用来停止，不禁用它，但要改变文字风格
    callBtn.innerHTML = '<i class="fas fa-stop-circle"></i> 停止点名';

    // 开始快速滚动姓名
    let rollCount = 0;
    // 清理旧定时器
    if (rollInterval) clearInterval(rollInterval);
    rollInterval = setInterval(() => {
        if (!isRolling) return;
        if (students.length === 0) {
            // 如果点名途中列表被奇怪清空（理论禁用操作不可能），但安全起见
            stopRollingAndPickFinal(true);
            return;
        }
        const tempIndex = Math.floor(Math.random() * students.length);
        const showName = students[tempIndex];
        resultNameDiv.innerText = showName;
        resultNameDiv.classList.add('rolling');
        rollCount++;
    }, 70);  // 70ms切换一次流畅感

    // 设定自动停止时长 (最低滚动1.2秒，最多滚动2秒后停止，增加抽选期待感)
    // 为了让点名有意外停止的"抽选感"，设定 1.5s ~ 2s 随机停止
    const rollDuration = 1200 + Math.random() * 800; // 1.2s ~ 2s
    setTimeout(() => {
        if (isRolling) {
            stopRollingAndPickFinal(true);
            // 恢复按钮文字
            if (callBtn) {
                callBtn.innerHTML = '<i class="fas fa-hand-peace"></i> 开始点名';
                callBtn.disabled = false;
            }
        }
    }, rollDuration);
}

// 单独兼容点名按钮：如果动画中则停止，否则开始
function onCallClick() {
    if (isRolling) {
        stopRollingAndPickFinal(true);
        if (callBtn) callBtn.innerHTML = '<i class="fas fa-hand-peace"></i> 开始点名';
    } else {
        startRollCall();
    }
}

// 添加单个学生
function addSingleStudent() {
    if (isRolling) { showToast("点名进行中，请稍后", "warning"); return; }
    let rawName = studentNameInput.value.trim();
    if (rawName === "") {
        showToast("姓名不能为空", "warning");
        return;
    }
    // 限制长度美观
    if (rawName.length > 20) rawName = rawName.slice(0,20);
    students.push(rawName);
    saveToLocal();
    renderStudentList();
    studentNameInput.value = "";
    showToast(`成功添加 "${rawName}"`, "success");
    // 如果之前结果区域是待点名/空，不用刷新点名结果
    if (resultNameDiv.innerText === '✨ 待点名 ✨' || resultNameDiv.innerText === '⚠️ 无学生') {
        resultNameDiv.innerText = '✨ 待点名 ✨';
        resultNameDiv.classList.remove('rolling');
    }
}

// 批量追加 (按行或逗号分割)
function batchAddStudents() {
    if (isRolling) { showToast("点名进行中，请稍后", "warning"); return; }
    let raw = batchNamesInput.value;
    if (!raw.trim()) {
        showToast("请输入至少一个姓名", "warning");
        return;
    }
    // 智能解析：优先按行分割，再把每行按逗号分割
    let lines = raw.split(/\r?\n/);
    let nameSet = [];
    for (let line of lines) {
        if (line.includes(',')) {
            let parts = line.split(',');
            for (let p of parts) {
                let n = p.trim();
                if (n) nameSet.push(n);
            }
        } else {
            let n = line.trim();
            if (n) nameSet.push(n);
        }
    }
    if (nameSet.length === 0) {
        showToast("未检测到有效姓名", "warning");
        return;
    }
    // 过滤过长和空
    const validNames = nameSet.filter(n => n.length > 0 && n.length <= 30).map(n => n.slice(0,20));
    if (validNames.length === 0) return;
    const beforeCount = students.length;
    students.push(...validNames);
    saveToLocal();
    renderStudentList();
    batchNamesInput.value = "";
    showToast(`成功添加 ${validNames.length} 位新同学，共 ${students.length} 人`, "success");
    if (resultNameDiv.innerText === '✨ 待点名 ✨' && students.length > 0) {
        resultNameDiv.innerText = '✨ 待点名 ✨';
    }
}

// 重置为默认名单
function resetDefault() {
    if (isRolling) { showToast("点名进行中，请稍后", "warning"); return; }
    if (confirm("⚠️ 重置默认将覆盖当前所有学生，确定吗？")) {
        students = [...DEFAULT_STUDENTS];
        saveToLocal();
        renderStudentList();
        resultNameDiv.innerText = '✨ 待点名 ✨';
        resultNameDiv.classList.remove('rolling');
        showToast(`已重置为默认 ${students.length} 位模范学生`, "info");
    }
}

// 清空所有学生
function clearAllStudents() {
    if (isRolling) { showToast("点名进行中，请稍后", "warning"); return; }
    if (students.length === 0) {
        showToast("名单已经是空的", "info");
        return;
    }
    if (confirm("❌ 确认清空全部学生吗？数据将丢失！")) {
        students = [];
        saveToLocal();
        renderStudentList();
        resultNameDiv.innerText = '✨ 待点名 ✨';
        resultNameDiv.classList.remove('rolling');
        showToast("已清空所有学生", "info");
    }
}

// 简易 toast 通知 (轻提示)
function showToast(msg, type = 'info') {
    // 创建临时提示
    const toast = document.createElement('div');
    toast.innerText = msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = type === 'error' ? '#e74c3c' : (type === 'warning' ? '#e67e22' : '#2c3e50');
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '40px';
    toast.style.fontSize = '0.85rem';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    toast.style.backdropFilter = 'blur(4px)';
    toast.style.fontWeight = '500';
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = '0.2s';
        setTimeout(() => toast.remove(), 300);
    }, 1800);
}

// 删除全部 (跟clearAll一样，但界面再提供一个)
function deleteAllHandler() {
    clearAllStudents();
}

// 初始化
function init() {
    loadFromLocal();
    renderStudentList();
    // 初始点名区域状态
    if (students.length === 0) {
        resultNameDiv.innerText = '✨ 待点名 ✨';
    } else {
        resultNameDiv.innerText = '✨ 待点名 ✨';
    }
    // 绑定事件
    callBtn.addEventListener('click', onCallClick);
    addStudentBtn.addEventListener('click', addSingleStudent);
    batchAddBtn.addEventListener('click', batchAddStudents);
    resetDefaultBtn.addEventListener('click', resetDefault);
    clearAllBtn.addEventListener('click', clearAllStudents);
    deleteSelectedAll.addEventListener('click', deleteAllHandler);
    // 回车添加
    studentNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addSingleStudent();
    });
}

// 启动
init();
