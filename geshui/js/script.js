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
    const bonusInput = document.getElementById('bonusInput');
    const bonusMethodSelect = document.getElementById('bonusMethodSelect');

    // 展示区
    const currentTaxDisplay = document.getElementById('currentTaxDisplay');
    const netSalaryDisplay = document.getElementById('netSalaryDisplay');
    const accumulatedTaxDisplay = document.getElementById('accumulatedTaxDisplay');
    const accumulatedNetDisplay = document.getElementById('accumulatedNetDisplay');
    const tableBody = document.getElementById('tableBody');
    
    // 年终奖结果展示
    const bonusTaxSeparateDisplay = document.getElementById('bonusTaxSeparate');
    const bonusTaxCombinedDisplay = document.getElementById('bonusTaxCombined');
    const bonusNetSeparateDisplay = document.getElementById('bonusNetSeparate');
    const bonusNetCombinedDisplay = document.getElementById('bonusNetCombined');

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

    // ---------- 🎁 年终奖计税函数 ----------
    /**
     * 年终奖单独计税（全年一次性奖金政策）
     * 将年终奖除以12个月，按商数确定适用税率和速算扣除数
     * @param {number} bonus - 年终奖金额
     * @returns {Object} { tax: 税额, netBonus: 税后奖金 }
     */
    function calcBonusTaxSeparate(bonus) {
        bonus = Math.max(0, Number(bonus) || 0);
        if (bonus === 0) return { tax: 0, netBonus: 0 };

        // 年终奖除以12找税率
        const monthlyAvg = bonus / 12;
        let taxRate = 0;
        let quickDeduction = 0;

        for (let bracket of TAX_BRACKETS) {
            if (monthlyAvg <= bracket.limit) {
                taxRate = bracket.rate;
                quickDeduction = bracket.quickDeduction;
                break;
            }
        }

        const tax = bonus * taxRate - quickDeduction;
        const netBonus = bonus - Math.max(0, tax);

        return { tax: Math.max(0, tax), netBonus };
    }

    /**
     * 年终奖并入综合所得计税
     * 将年终奖加到年度总收入中，按累计预扣法计算
     * @param {number} bonus - 年终奖金额
     * @param {number} monthlyIncome - 月收入
     * @param {number} insurance - 月五险一金
     * @param {number} deduction - 月专项附加扣除
     * @param {number} threshold - 月起征点
     * @returns {Object} { additionalTax: 额外税额, netBonus: 税后奖金 }
     */
    function calcBonusTaxCombined(bonus, monthlyIncome, insurance, deduction, threshold) {
        bonus = Math.max(0, Number(bonus) || 0);
        if (bonus === 0) return { additionalTax: 0, netBonus: 0 };

        // 计算不含年终奖的年度个税
        const detailsWithoutBonus = computeMonthlyDetails(monthlyIncome, 12, insurance, deduction, threshold);
        const taxWithoutBonus = detailsWithoutBonus[11].accumTax; // 12月累计税额

        // 计算含年终奖的年度个税（将年终奖平均到12个月）
        const monthlyIncomeWithBonus = monthlyIncome + (bonus / 12);
        const detailsWithBonus = computeMonthlyDetails(monthlyIncomeWithBonus, 12, insurance, deduction, threshold);
        const taxWithBonus = detailsWithBonus[11].accumTax; // 12月累计税额

        // 年终奖带来的额外税额
        const additionalTax = taxWithBonus - taxWithoutBonus;
        const netBonus = bonus - Math.max(0, additionalTax);

        return { additionalTax: Math.max(0, additionalTax), netBonus };
    }

    // ---------- 🔄 更新UI (核心渲染) ----------
    function refreshCalculator() {
        // 1. 读取输入并校验
        const monthlyIncome = parseFloat(incomeInput.value) || 0;
        const monthCount = parseInt(monthSelect.value, 10) || 1;
        const insurance = parseFloat(insuranceInput.value) || 0;
        const deduction = parseFloat(deductionInput.value) || 0;
        const threshold = parseFloat(thresholdInput.value) || DEFAULT_THRESHOLD;
        const bonus = parseFloat(bonusInput.value) || 0;
        const bonusMethod = bonusMethodSelect.value;

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
        
        // 如果当月税额为0，添加免税提示
        if (currentMonthTax === 0) {
            currentTaxDisplay.innerHTML = formatMoney(0) + '<div style="font-size:0.9rem; margin-top:4px; opacity:0.8;">✅ 免税</div>';
        }

        // 6. 计算并显示年终奖税额
        if (bonus > 0) {
            const separateResult = calcBonusTaxSeparate(bonus);
            const combinedResult = calcBonusTaxCombined(bonus, monthlyIncome, insurance, deduction, threshold);

            bonusTaxSeparateDisplay.textContent = formatMoney(separateResult.tax);
            bonusNetSeparateDisplay.textContent = formatMoney(separateResult.netBonus);
            bonusTaxCombinedDisplay.textContent = formatMoney(combinedResult.additionalTax);
            bonusNetCombinedDisplay.textContent = formatMoney(combinedResult.netBonus);

            // 自动比较两种方式，推荐税额更低的方案（与用户选择无关）
            highlightRecommendedBonus(separateResult.tax, combinedResult.additionalTax);
        } else {
            bonusTaxSeparateDisplay.textContent = '¥0.00';
            bonusNetSeparateDisplay.textContent = '¥0.00';
            bonusTaxCombinedDisplay.textContent = '¥0.00';
            bonusNetCombinedDisplay.textContent = '¥0.00';
            clearBonusHighlight();
        }

        // 7. 渲染表格
        renderTable(details);
    }

    /** 高亮推荐年终奖计税方式 */
    function highlightRecommendedBonus(separateTax, combinedTax) {
        const separateCard = document.querySelector('.bonus-card.separate');
        const combinedCard = document.querySelector('.bonus-card.combined');
        
        if (!separateCard || !combinedCard) return;

        // 移除之前的高亮
        separateCard.classList.remove('recommended');
        combinedCard.classList.remove('recommended');

        // 比较两种方式，税额少的更优（自动推荐，不受用户选择影响）
        if (separateTax < combinedTax) {
            separateCard.classList.add('recommended');
        } else if (combinedTax < separateTax) {
            combinedCard.classList.add('recommended');
        }
        // 如果税额相等，则都不高亮
    }

    /** 清除年终奖高亮 */
    function clearBonusHighlight() {
        const separateCard = document.querySelector('.bonus-card.separate');
        const combinedCard = document.querySelector('.bonus-card.combined');
        
        if (separateCard) separateCard.classList.remove('recommended');
        if (combinedCard) combinedCard.classList.remove('recommended');
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
    const inputs = [incomeInput, monthSelect, insuranceInput, deductionInput, thresholdInput, bonusInput, bonusMethodSelect];
    inputs.forEach(input => input.addEventListener('input', refreshCalculator));
    // 额外处理change以确保select也能触发
    monthSelect.addEventListener('change', refreshCalculator);
    bonusMethodSelect.addEventListener('change', refreshCalculator);

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
    bonusInput.addEventListener('blur', sanitizeNumberInput);

    // 初始化计算 (默认值触发)
    refreshCalculator();

    // ---------- 📌 扩展指引 (通过注释/控制台说明) ----------
    // 年终奖计税已实现两种方法：
    // 1. 单独计税：使用全年一次性奖金政策，除以12找税率
    // 2. 并入综合所得：将年终奖平均到12个月，重新计算年度个税
    // 系统会自动比较两种方式，推荐税额更低的方案

    // 如果希望程序化修改起征点/税率，可直接编辑上方 TAX_BRACKETS 及 DEFAULT_THRESHOLD。
    // 所有配置集中，便于政策更新。
})();
