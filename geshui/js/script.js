(function(){
    "use strict";

    // ---------- 🔧 税务配置数据 (清晰分离，便于维护) ----------
    // 居民个人工资薪金预扣预缴税率表（年度累计应纳税所得额适用）
    // 依据：2019年起7级超额累进税率
    const TAX_BRACKETS = [
        { limit: 36000, rate: 0.03, quickDeduction: 0 },        // 不超过36000
        { limit: 144000, rate: 0.10, quickDeduction: 2520 },     // 超过36000至144000
        { limit: 300000, rate: 0.20, quickDeduction: 16920 },    // 超过144000至300000
        { limit: 420000, rate: 0.25, quickDeduction: 31920 },    // 超过300000至420000
        { limit: 660000, rate: 0.30, quickDeduction: 52920 },    // 超过420000至660000
        { limit: 960000, rate: 0.35, quickDeduction: 85920 },    // 超过660000至960000
        { limit: Infinity, rate: 0.45, quickDeduction: 181920 }  // 超过960000
    ];

    // 默认起征点（可配置）
    const DEFAULT_THRESHOLD = 5000;

    // ---------- 🌐 DOM 元素 ----------
    const incomeInput = document.getElementById('incomeInput');
    const monthSelect = document.getElementById('monthSelect');
    const insuranceInput = document.getElementById('insuranceInput');
    const deductionInput = document.getElementById('deductionInput');
    const thresholdInput = document.getElementById('thresholdInput');

    // 展示区
    const currentTaxDisplay = document.getElementById('currentTaxDisplay');
    const netSalaryDisplay = document.getElementById('netSalaryDisplay');
    const accumulatedTaxDisplay = document.getElementById('accumulatedTaxDisplay');
    const accumulatedNetDisplay = document.getElementById('accumulatedNetDisplay');
    const tableBody = document.getElementById('tableBody');

    // ---------- 🕒 初始化月份下拉 (1-12，默认当前系统月份) ----------
    function initMonthSelect() {
        const currentMonth = new Date().getMonth() + 1; // 1-12
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} 月`;
            if (i === currentMonth) option.selected = true;
            monthSelect.appendChild(option);
        }
    }
    initMonthSelect();

    // 设置起征点默认值
    thresholdInput.value = DEFAULT_THRESHOLD;

    // ---------- 🧮 核心计算引擎：返回每月明细数组 ----------
    /**
     * 计算累计预扣法下各月数据
     * @param {number} monthlyIncome - 税前月收入
     * @param {number} monthCount - 计算到第几个月 (1~12)
     * @param {number} insurance - 每月五险一金个人部分
     * @param {number} deduction - 每月专项附加扣除
     * @param {number} threshold - 每月免征额
     * @returns {Array} 每月明细对象数组
     */
    function computeMonthlyDetails(monthlyIncome, monthCount, insurance, deduction, threshold) {
        // 边界保护：确保非负数
        monthlyIncome = Math.max(0, Number(monthlyIncome) || 0);
        insurance = Math.max(0, Number(insurance) || 0);
        deduction = Math.max(0, Number(deduction) || 0);
        threshold = Math.max(0, Number(threshold) || 0);
        monthCount = Math.min(12, Math.max(1, Number(monthCount) || 1));

        const details = [];
        let prevAccumulatedTax = 0;   // 上月累计预扣税额

        for (let month = 1; month <= monthCount; month++) {
            // 累计收入
            const accumIncome = monthlyIncome * month;
            // 累计免征额
            const accumThreshold = threshold * month;
            // 累计五险一金
            const accumInsurance = insurance * month;
            // 累计专项附加扣除
            const accumDeduction = deduction * month;
            // 累计扣除总额 (用于展示)
            const totalDeductions = accumThreshold + accumInsurance + accumDeduction;

            // 累计应纳税所得额 = 累计收入 - 累计免征额 - 累计五险一金 - 累计专项附加扣除
            let accumTaxable = accumIncome - accumThreshold - accumInsurance - accumDeduction;
            if (accumTaxable < 0) accumTaxable = 0;

            // 根据累计应纳税所得额计算累计预扣税额
            let accumTax = 0;
            if (accumTaxable > 0) {
                for (let bracket of TAX_BRACKETS) {
                    if (accumTaxable <= bracket.limit) {
                        accumTax = accumTaxable * bracket.rate - bracket.quickDeduction;
                        break;
                    }
                }
            }
            // 累计税额不能为负
            accumTax = Math.max(0, accumTax);

            // 当月应缴个税 = 累计预扣税额 - 前期已缴个税总和 (上月累计预扣)
            let monthlyTax = accumTax - prevAccumulatedTax;
            if (monthlyTax < 0) monthlyTax = 0;   // 预扣制下不会出现负数，但防止边界

            // 当月实发工资 = 税前月收入 - 五险一金 - 当月个税
            const netSalary = monthlyIncome - insurance - monthlyTax;

            // 保存明细
            details.push({
                month,
                accumIncome,
                totalDeductions,           // 累计扣除（三项合计）
                accumTaxable,
                accumTax,
                monthlyTax,
                netSalary
            });

            // 更新上月累计税额供下月使用
            prevAccumulatedTax = accumTax;
        }

        return details;
    }

    // ---------- 💰 格式化货币 (千分位，保留两位小数) ----------
    function formatMoney(value) {
        const num = Number(value);
        if (isNaN(num)) return '¥0.00';
        return '¥' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // ---------- 🔄 更新UI (核心渲染) ----------
    function refreshCalculator() {
        // 1. 读取输入并校验
        const monthlyIncome = parseFloat(incomeInput.value) || 0;
        const monthCount = parseInt(monthSelect.value, 10) || 1;
        const insurance = parseFloat(insuranceInput.value) || 0;
        const deduction = parseFloat(deductionInput.value) || 0;
        const threshold = parseFloat(thresholdInput.value) || DEFAULT_THRESHOLD;

        // 2. 计算明细
        const details = computeMonthlyDetails(monthlyIncome, monthCount, insurance, deduction, threshold);

        // 3. 如果没有明细（monthCount=0）返回，但monthCount至少为1
        if (details.length === 0) return;

        // 4. 获取最后一个月（当前所选月份）的数据
        const lastMonthData = details[details.length - 1];
        const currentMonthTax = lastMonthData.monthlyTax;
        const currentNetSalary = lastMonthData.netSalary;
        const accumulatedTax = lastMonthData.accumTax;   // 累计预扣税额（到本月）

        // 累计实发收入 = 各月实发之和
        const totalNetIncome = details.reduce((sum, d) => sum + d.netSalary, 0);

        // 5. 更新顶部卡片
        currentTaxDisplay.textContent = formatMoney(currentMonthTax);
        netSalaryDisplay.textContent = formatMoney(currentNetSalary);
        accumulatedTaxDisplay.textContent = formatMoney(accumulatedTax);
        accumulatedNetDisplay.textContent = formatMoney(totalNetIncome);

        // 6. 渲染表格
        renderTable(details);
    }

    /** 渲染月度明细表格 */
    function renderTable(details) {
        if (!details.length) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px;">暂无数据</td></tr>`;
            return;
        }

        let html = '';
        for (let d of details) {
            html += `<tr>
                <td>${d.month}月</td>
                <td>${formatMoney(d.accumIncome)}</td>
                <td>${formatMoney(d.totalDeductions)}</td>
                <td>${formatMoney(d.accumTaxable)}</td>
                <td>${formatMoney(d.accumTax)}</td>
                <td>${formatMoney(d.monthlyTax)}</td>
                <td>${formatMoney(d.netSalary)}</td>
            </tr>`;
        }
        tableBody.innerHTML = html;
    }

    // ---------- 🎯 事件绑定：实时更新 ----------
    const inputs = [incomeInput, monthSelect, insuranceInput, deductionInput, thresholdInput];
    inputs.forEach(input => input.addEventListener('input', refreshCalculator));
    // 额外处理change以确保select也能触发
    monthSelect.addEventListener('change', refreshCalculator);

    // 处理输入非数值/负值等边界 (blur时修正)
    function sanitizeNumberInput(e) {
        const input = e.target;
        if (input.type === 'number') {
            let val = parseFloat(input.value);
            if (isNaN(val) || val < 0) input.value = 0;
        }
    }
    incomeInput.addEventListener('blur', sanitizeNumberInput);
    insuranceInput.addEventListener('blur', sanitizeNumberInput);
    deductionInput.addEventListener('blur', sanitizeNumberInput);
    thresholdInput.addEventListener('blur', function(e) {
        let val = parseFloat(e.target.value);
        if (isNaN(val) || val < 0) e.target.value = DEFAULT_THRESHOLD;
    });

    // 初始化计算 (默认值触发)
    refreshCalculator();

    // ---------- 📌 扩展指引 (通过注释/控制台说明) ----------
    // 【扩展点】如需增加年终奖单独计税模块:
    // 1. 添加输入框 <input id="bonusInput">
    // 2. 编写函数 calcAnnualBonusTax(bonus) 使用月度税率表 (bonus/12找级距，再用总额*税率-速算扣除)
    // 3. 在UI中展示并独立于累计预扣。
    // 详见页面底部 <details> 中的说明。

    // 如果希望程序化修改起征点/税率，可直接编辑上方 TAX_BRACKETS 及 DEFAULT_THRESHOLD。
    // 所有配置集中，便于政策更新。
})();
