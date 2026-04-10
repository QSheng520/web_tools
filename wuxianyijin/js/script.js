(function(){
    "use strict";

    // ---------- 🌍 城市配置 (可扩展、易维护) ----------
    // 说明: 比例均为小数 (0.08 = 8%)；医疗可带额外固定金额(extraPersonalFixed)
    // baseLimit: lower/upper 为社保缴费基数上下限 (公积金暂用同一套，亦可独立配置)
    // ⚠️ 政策可能调整，更新比例/上下限直接修改此对象即可。
    const CITY_CONFIG = {
        beijing: {
            name: '北京',
            baseLimit: { lower: 6326, upper: 33891 },     // 2024年参考
            pension: { personal: 0.08, company: 0.16 },
            medical: { personal: 0.02, company: 0.098, extraPersonalFixed: 3 },  // 个人+3元
            unemployment: { personal: 0.005, company: 0.005 },
            workInjury: { personal: 0, company: 0.002 },    // 工伤企业约0.2%
            maternity: { personal: 0, company: 0.008 },     // 生育已并入医疗？但保留展示
            housingFund: { personal: 0.07, company: 0.07 }  // 7% 常见
        },
        shanghai: {
            name: '上海',
            baseLimit: { lower: 7310, upper: 36549 },       // 参考
            pension: { personal: 0.08, company: 0.16 },
            medical: { personal: 0.02, company: 0.10, extraPersonalFixed: 0 },
            unemployment: { personal: 0.005, company: 0.005 },
            workInjury: { personal: 0, company: 0.0016 },    // 约0.16%
            maternity: { personal: 0, company: 0.01 },
            housingFund: { personal: 0.07, company: 0.07 }
        },
        guangzhou: {
            name: '广州',
            baseLimit: { lower: 5284, upper: 32376 },       // 参考
            pension: { personal: 0.08, company: 0.14 },      // 企业14%
            medical: { personal: 0.02, company: 0.055, extraPersonalFixed: 0 },
            unemployment: { personal: 0.002, company: 0.008 }, // 广略有不同
            workInjury: { personal: 0, company: 0.002 },
            maternity: { personal: 0, company: 0.0085 },
            housingFund: { personal: 0.07, company: 0.07 }
        },
        shenzhen: {
            name: '深圳',
            baseLimit: { lower: 3523, upper: 32376 },       // 深户/非深户简化，一档
            pension: { personal: 0.08, company: 0.14 },      // 深户企业14%?
            medical: { personal: 0.02, company: 0.06, extraPersonalFixed: 0 },
            unemployment: { personal: 0.003, company: 0.007 },
            workInjury: { personal: 0, company: 0.0014 },
            maternity: { personal: 0, company: 0.0045 },
            housingFund: { personal: 0.07, company: 0.07 }
        },
        hangzhou: {
            name: '杭州',
            baseLimit: { lower: 4462, upper: 24060 },        // 参考
            pension: { personal: 0.08, company: 0.15 },
            medical: { personal: 0.02, company: 0.099, extraPersonalFixed: 0 },
            unemployment: { personal: 0.005, company: 0.005 },
            workInjury: { personal: 0, company: 0.003 },
            maternity: { personal: 0, company: 0.005 },
            housingFund: { personal: 0.07, company: 0.07 }
        }
    };

    // ---------- DOM 元素 ----------
    const salaryInput = document.getElementById('salaryInput');
    const citySelect = document.getElementById('citySelect');
    const modeAuto = document.getElementById('modeAuto');
    const modeManual = document.getElementById('modeManual');
    const manualBaseInput = document.getElementById('manualBaseInput');
    const calcBtn = document.getElementById('calcBtn');
    const resetHintBtn = document.getElementById('resetHintBtn');
    const actualBaseDisplay = document.getElementById('actualBaseDisplay');
    const resultBody = document.getElementById('resultBody');
    const personalTotalSpan = document.getElementById('personalTotal');
    const companyTotalSpan = document.getElementById('companyTotal');
    const netSalarySpan = document.getElementById('netSalary');

    // ---------- 辅助函数: 钳制基数 ----------
    function clampBase(value, lower, upper) {
        return Math.max(lower, Math.min(upper, value));
    }

    // ---------- 获取当前城市配置 ----------
    function getCurrentCityConfig() {
        return CITY_CONFIG[citySelect.value] || CITY_CONFIG.beijing;
    }

    // ---------- 计算实际缴费基数 (根据模式和工资/手动输入) ----------
    function computeActualBase() {
        const config = getCurrentCityConfig();
        const lower = config.baseLimit.lower;
        const upper = config.baseLimit.upper;
        const salary = parseFloat(salaryInput.value);
        const validSalary = (isNaN(salary) || salary < 0) ? 0 : salary;

        if (modeManual.checked) {
            let manualVal = parseFloat(manualBaseInput.value);
            if (isNaN(manualVal) || manualVal < 0) manualVal = 0;
            // 手动基数也受上下限钳制 (符合社保规则)
            return clampBase(manualVal, lower, upper);
        } else {
            // 自动模式：工资钳制
            return clampBase(validSalary, lower, upper);
        }
    }

    // ---------- 更新手动输入框的启用/禁用及同步(自动模式下同步基数显示) ----------
    function syncManualInputState() {
        const isManual = modeManual.checked;
        manualBaseInput.disabled = !isManual;
        
        if (!isManual) {
            // 自动模式：让手动输入框显示当前理论基数（基于工资钳制），但不影响计算
            const config = getCurrentCityConfig();
            const salary = parseFloat(salaryInput.value) || 0;
            const autoBase = clampBase(salary, config.baseLimit.lower, config.baseLimit.upper);
            manualBaseInput.value = Math.round(autoBase); // 展示用
        }
        // 手动模式下不自动改写用户输入，保留其值
    }

    // ---------- 核心计算并渲染表格 ----------
    function calculateAndRender() {
        const config = getCurrentCityConfig();
        const lower = config.baseLimit.lower;
        const upper = config.baseLimit.upper;
        const salary = parseFloat(salaryInput.value) || 0;
        
        // 确定实际基数
        const actualBase = computeActualBase();
        
        // 更新显示基数
        actualBaseDisplay.textContent = `⚡ 实际缴费基数: ${actualBase.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
        
        // 如果自动模式，保持手动输入框同步显示 (但不影响计算)
        if (!modeManual.checked) {
            manualBaseInput.value = Math.round(actualBase);
        }

        // 提取各项配置
        const pen = config.pension;
        const med = config.medical;
        const unemp = config.unemployment;
        const injury = config.workInjury;
        const maternity = config.maternity;
        const hf = config.housingFund;

        // ----- 个人缴纳计算 -----
        const personalPension = actualBase * pen.personal;
        // 医疗个人 = 基数*比例 + 固定附加
        const personalMedical = actualBase * med.personal + (med.extraPersonalFixed || 0);
        const personalUnemp = actualBase * unemp.personal;
        const personalInjury = actualBase * injury.personal;   // 一般为0
        const personalMaternity = actualBase * maternity.personal; // 0
        const personalHF = actualBase * hf.personal;

        // ----- 企业缴纳计算 -----
        const companyPension = actualBase * pen.company;
        const companyMedical = actualBase * med.company;
        const companyUnemp = actualBase * unemp.company;
        const companyInjury = actualBase * injury.company;
        const companyMaternity = actualBase * maternity.company;
        const companyHF = actualBase * hf.company;

        // 个人合计 & 企业合计
        const personalTotal = personalPension + personalMedical + personalUnemp + personalInjury + personalMaternity + personalHF;
        const companyTotal = companyPension + companyMedical + companyUnemp + companyInjury + companyMaternity + companyHF;
        
        // 实发工资 = 税前工资 - 个人五险一金 (未扣个税)
        const netSalary = Math.max(0, salary - personalTotal);

        // ---------- 渲染表格 ----------
        const rows = [
            { name: '养老保险', p: personalPension, c: companyPension },
            { name: '医疗保险', p: personalMedical, c: companyMedical },
            { name: '失业保险', p: personalUnemp, c: companyUnemp },
            { name: '工伤保险', p: personalInjury, c: companyInjury },
            { name: '生育保险', p: personalMaternity, c: companyMaternity },
            { name: '住房公积金', p: personalHF, c: companyHF }
        ];

        let html = '';
        rows.forEach(item => {
            const sum = item.p + item.c;
            html += `<tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.p.toFixed(2)}</td>
                <td>${item.c.toFixed(2)}</td>
                <td>${sum.toFixed(2)}</td>
            </tr>`;
        });

        // 增加汇总行 (个人合计、企业合计)
        html += `<tr class="highlight-row" style="border-top: 2px solid #dbe7f5;">
            <td><strong>📋 合计</strong></td>
            <td><strong>${personalTotal.toFixed(2)}</strong></td>
            <td><strong>${companyTotal.toFixed(2)}</strong></td>
            <td><strong>${(personalTotal + companyTotal).toFixed(2)}</strong></td>
        </tr>`;

        resultBody.innerHTML = html;

        // 更新底部卡片
        personalTotalSpan.textContent = personalTotal.toFixed(2);
        companyTotalSpan.textContent = companyTotal.toFixed(2);
        netSalarySpan.textContent = netSalary.toFixed(2);
    }

    // ---------- 重置为默认 (北京, 工资12000, 自动模式) ----------
    function resetToDefault() {
        salaryInput.value = 12000;
        citySelect.value = 'beijing';
        modeAuto.checked = true;
        modeManual.checked = false;
        // 手动基数输入框同步
        const config = CITY_CONFIG.beijing;
        const autoBase = clampBase(12000, config.baseLimit.lower, config.baseLimit.upper);
        manualBaseInput.value = Math.round(autoBase);
        manualBaseInput.disabled = true;
        
        calculateAndRender();
    }

    // ---------- 事件绑定 & 实时联动 ----------
    function bindEvents() {
        // 计算按钮
        calcBtn.addEventListener('click', (e) => {
            e.preventDefault();
            calculateAndRender();
        });

        // 重置按钮
        resetHintBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetToDefault();
        });

        // 输入变化实时计算 (工资、城市、模式、手动基数)
        salaryInput.addEventListener('input', () => {
            syncManualInputState();   // 自动模式下手动框跟随工资基数
            calculateAndRender();
        });
        
        citySelect.addEventListener('change', () => {
            // 切换城市后，如果自动模式需要刷新手动框显示
            syncManualInputState();
            calculateAndRender();
        });

        modeAuto.addEventListener('change', () => {
            if (modeAuto.checked) {
                manualBaseInput.disabled = true;
                syncManualInputState();  // 让手动框显示当前钳制基数
                calculateAndRender();
            }
        });

        modeManual.addEventListener('change', () => {
            if (modeManual.checked) {
                manualBaseInput.disabled = false;
                // 确保手动框有一个合理的初始值（基于当前工资钳制，但用户可以改）
                const config = getCurrentCityConfig();
                const salary = parseFloat(salaryInput.value) || 0;
                const baseHint = clampBase(salary, config.baseLimit.lower, config.baseLimit.upper);
                // 只有当手动框为空或为0时给个建议值，但不强制覆盖用户之前输入
                const currentManual = parseFloat(manualBaseInput.value);
                if (isNaN(currentManual) || currentManual <= 0) {
                    manualBaseInput.value = Math.round(baseHint);
                }
                calculateAndRender();
            }
        });

        manualBaseInput.addEventListener('input', () => {
            if (modeManual.checked) {
                calculateAndRender();
            }
        });

        // 额外：当手动输入框在手动模式下改变，立即重算
        // 处理边界：若工资输入无效，置0
    }

    // ---------- 初始化页面 ----------
    function init() {
        // 设置手动基数默认显示
        const initConfig = CITY_CONFIG.beijing;
        const initSalary = 12000;
        salaryInput.value = initSalary;
        const autoBase = clampBase(initSalary, initConfig.baseLimit.lower, initConfig.baseLimit.upper);
        manualBaseInput.value = Math.round(autoBase);
        manualBaseInput.disabled = true;  // 默认自动模式

        calculateAndRender();
        bindEvents();
    }

    init();

    // ---------- 📌 扩展接口说明 (个税预留) ----------
    // 如需加入个税计算，可在 calculateAndRender 中增加:
    // const taxableIncome = salary - personalTotal - 5000 (起征点);
    // 然后根据七级超额累进税率计算个税，再从实发工资中扣除。
    // 目前实发工资 = 税前工资 - 个人五险一金 (未扣个税)。
    // 城市配置可任意增删，比例与上下限修改即生效。
    // ------------------------------------------------
})();
