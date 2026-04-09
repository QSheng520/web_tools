(function() {
    // DOM 元素
    const heightInput = document.getElementById('heightCm');
    const weightInput = document.getElementById('weightKg');
    const calcBtn = document.getElementById('calculateBtn');
    const bmiValueSpan = document.getElementById('bmiValue');
    const statusBadge = document.getElementById('statusBadge');
    const statusDescSpan = document.getElementById('statusDesc');
    const planContentDiv = document.getElementById('planContent');

    // 辅助函数: 计算BMI并获取分类
    function calculateBMIAndCategory(heightCm, weightKg) {
        if (!heightCm || !weightKg) return null;
        const heightM = heightCm / 100;
        const bmi = weightKg / (heightM * heightM);
        let category = '';
        if (bmi < 18.5) category = 'underweight';
        else if (bmi >= 18.5 && bmi < 24) category = 'normal';
        else if (bmi >= 24 && bmi < 28) category = 'overweight';
        else category = 'obese';
        return { bmi, category };
    }

    // 获取中文分类文本与描述
    function getCategoryInfo(category) {
        switch(category) {
            case 'underweight': return { label: '偏瘦 · 体重过轻', desc: '低于健康范围，需加强营养与增肌' };
            case 'normal': return { label: '健康体重 · 标准范围', desc: 'BMI理想，继续保持良好习惯' };
            case 'overweight': return { label: '超重 · 偏高范围', desc: '体重超标，建议调整饮食与增加运动' };
            case 'obese': return { label: '肥胖 · 健康风险较高', desc: '需科学减重，改善代谢健康' };
            default: return { label: '未知', desc: '' };
        }
    }

    // 核心: 生成健康生活方案 (包含理想体重范围 + 饮食+运动+生活习惯)
    function generateHealthPlan(category, heightCm, weightKg, bmiValueNum) {
        if (!heightCm || heightCm <= 0 || !weightKg || weightKg <= 0 || isNaN(bmiValueNum)) {
            return `<div class="error-message">⚠️ 请输入有效的身高(>0cm)和体重(>0kg)</div>`;
        }
        
        const heightM = heightCm / 100;
        // 健康体重范围: 18.5 ~ 24 (正常范围)
        const minHealthyWeight = (18.5 * heightM * heightM).toFixed(1);
        const maxHealthyWeight = (24 * heightM * heightM).toFixed(1);
        
        // 根据分类生成建议文案
        let dietAdvice = '';
        let exerciseAdvice = '';
        let lifestyleAdvice = '';
        
        switch(category) {
            case 'underweight':
                dietAdvice = '🍚 均衡增加热量摄入，每日增加300~500大卡。多摄入优质蛋白（鸡蛋、鱼肉、豆制品）、健康脂肪（坚果、牛油果）及复合碳水（全麦、燕麦）。少食多餐，避免高糖零食。';
                exerciseAdvice = '🏋️‍♂️ 以力量训练为主（深蹲、俯卧撑、哑铃），每周3~4次，配合少量有氧。增肌同时改善食欲。';
                lifestyleAdvice = '😴 保证充足睡眠7~9小时，减少压力。可记录饮食日记，逐步增加体重至健康范围。';
                break;
            case 'normal':
                dietAdvice = '🥗 继续保持均衡膳食：蔬菜水果占餐盘一半，全谷物+优质蛋白。控制添加糖和饱和脂肪，规律三餐，适量饮水。';
                exerciseAdvice = '🚴 每周至少150分钟中等强度有氧（快走、慢跑、游泳）搭配2次力量训练，维持代谢与体态。';
                lifestyleAdvice = '🧘 维持健康作息，定期监测体重，预防未来体重波动。保持良好心态，享受活力生活。';
                break;
            case 'overweight':
                dietAdvice = '🥦 控制总热量，每日减少300~500大卡。优先选择低GI碳水（糙米、藜麦），增加膳食纤维（绿叶蔬菜），减少油炸甜点。每餐七分饱。';
                exerciseAdvice = '🏃 有氧运动为主：快走、慢跑、跳绳、椭圆机，每周5次，每次40分钟以上，搭配核心训练提升代谢。';
                lifestyleAdvice = '📉 设定减重目标每周0.5~1kg，避免节食。多喝水，保证睡眠，减少久坐，每小时起来活动5分钟。';
                break;
            case 'obese':
                dietAdvice = '🍽️ 严格调整饮食结构：咨询营养师更佳。增加蔬菜比例，杜绝含糖饮料，选择蒸煮炖拌烹饪方式。控制精制碳水，多吃高饱腹感食物（魔芋、豆类）。';
                exerciseAdvice = '🚶‍♀️ 从低冲击运动开始：快走、水中行走、固定单车，每次30分钟逐步增加强度。避免关节损伤，运动前热身。每周累计200分钟以上中低强度运动。';
                lifestyleAdvice = '📅 建立长期健康习惯，记录饮食与运动进展。可寻求专业支持，定期体检。保证睡眠规律，保持积极心理暗示，循序渐进减重。';
                break;
            default:
                dietAdvice = '保持多样化饮食，注重营养密度。';
                exerciseAdvice = '每日适量活动，维持身体机能。';
                lifestyleAdvice = '规律作息，关注身体信号。';
        }
        
        // 额外依据BMI数值增加针对性的强烈建议(如果是极值)
        let extraNote = '';
        if (category === 'obese' && bmiValueNum >= 32) {
            extraNote = '<div class="advice-item"><div class="advice-icon">⚠️</div><div class="advice-text"><strong>特别提醒：</strong> BMI超过32属于较高肥胖风险，建议优先咨询医生或注册营养师，制定安全减重计划，避免剧烈运动伤害。</div></div>';
        } else if (category === 'underweight' && bmiValueNum < 16) {
            extraNote = '<div class="advice-item"><div class="advice-icon">🩺</div><div class="advice-text"><strong>健康警示：</strong> 体重严重过轻可能影响免疫及骨骼健康，请考虑全面体检并寻求专业营养指导。</div></div>';
        }
        
        // 组装完整方案HTML
        return `
            <div class="ideal-weight">
                🎯 基于您的身高 ${heightCm} cm，<strong>健康体重范围</strong>为 ${minHealthyWeight} kg  ~ ${maxHealthyWeight} kg<br>
                ${category === 'underweight' ? '✨ 当前低于此范围，增重至该区间将改善活力' : (category === 'overweight' || category === 'obese' ? '✨ 科学减重至健康范围，降低慢性病风险' : '✨ 恭喜您体重在健康范围内，继续保持')}
            </div>
            <div class="advice-block">
                <div class="advice-item">
                    <div class="advice-icon">🥑</div>
                    <div class="advice-text"><strong>饮食方案</strong><br>${dietAdvice}</div>
                </div>
                <div class="advice-item">
                    <div class="advice-icon">🏃</div>
                    <div class="advice-text"><strong>运动指南</strong><br>${exerciseAdvice}</div>
                </div>
                <div class="advice-item">
                    <div class="advice-icon">🌙</div>
                    <div class="advice-text"><strong>生活习惯</strong><br>${lifestyleAdvice}</div>
                </div>
                ${extraNote ? extraNote : ''}
                <div class="advice-item">
                    <div class="advice-icon">📈</div>
                    <div class="advice-text"><strong>长期策略</strong><br>每周监测BMI变化，小步调整。健康生活是持续的过程，保持耐心与正向反馈。</div>
                </div>
            </div>
        `;
    }
    
    // 更新所有UI (结果+方案)
    function updateBMIAndPlan() {
        // 获取原始值
        let heightCm = parseFloat(heightInput.value);
        let weightKg = parseFloat(weightInput.value);
        
        // 严密验证
        const isValid = !isNaN(heightCm) && !isNaN(weightKg) && heightCm > 0 && weightKg > 0;
        if (!isValid) {
            bmiValueSpan.innerText = '--';
            statusBadge.innerText = '无效输入';
            statusDescSpan.innerText = '身高/体重必须是大于0的数字';
            planContentDiv.innerHTML = `<div class="error-message">⚠️ 数据无效，请检查身高(cm)和体重(kg)是否为正数。</div>`;
            // 清除所有状态类
            bmiValueSpan.className = 'value';
            statusBadge.className = 'status-badge';
            document.getElementById('resultArea').className = 'result-area';
            return;
        }
        
        // 边界合理范围提示但不阻断(允许非常规但正数)
        if (heightCm < 60) {
            // 轻度提示，但不影响计算 (可能是儿童或特殊情况，仍进行计算)
            console.log("身高偏低，仍按公式计算");
        }
        
        // 计算BMI
        const result = calculateBMIAndCategory(heightCm, weightKg);
        if (!result) return;
        const { bmi, category } = result;
        const bmiFixed = bmi.toFixed(1);
        bmiValueSpan.innerText = bmiFixed;
        
        // 评估健康状况信息
        const catInfo = getCategoryInfo(category);
        statusBadge.innerText = catInfo.label;
        // 增加描述与建议标语
        let extraDesc = '';
        if (category === 'underweight') extraDesc = ' · 建议增重计划';
        else if (category === 'normal') extraDesc = ' · 理想状态，继续保持';
        else if (category === 'overweight') extraDesc = ' · 需控制体重';
        else if (category === 'obese') extraDesc = ' · 重点健康干预';
        statusDescSpan.innerText = catInfo.desc + extraDesc;
        
        // 动态应用颜色样式类
        bmiValueSpan.className = `value ${category}`;
        statusBadge.className = `status-badge ${category}`;
        document.getElementById('resultArea').className = `result-area ${category}`;
        
        // 动态更新健康生活方案 (基于当前类别与身高体重)
        const planHTML = generateHealthPlan(category, heightCm, weightKg, bmi);
        planContentDiv.innerHTML = planHTML;
    }
    
    // 额外添加输入框支持 "Enter" 键触发计算
    function setupEnterKey() {
        const inputs = [heightInput, weightInput];
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    updateBMIAndPlan();
                }
            });
        });
    }
    
    // 初次加载时显示默认数据预览 (因为输入框默认值175cm, 68kg)
    function initDefaultPreview() {
        // 确保初始展示170cm 68kg 对应的健康结果 (默认值已在html中设定)
        // 但需要确保输入框的值和实际展示同步，因为用户可能还没点击按钮，为了体验自动计算一次展示效果
        // 但为了尊重用户习惯，首次加载自动计算一次，展示方案，但不会干扰用户输入 (这更友好)
        if (heightInput.value && weightInput.value) {
            updateBMIAndPlan();
        } else {
            // 如果意外无默认，不计算
            planContentDiv.innerHTML = `<div style="text-align: center; color: #6f8eaa; padding: 1rem;">✨ 输入身高体重后点击计算 ✨</div>`;
        }
    }
    
    // 绑定按钮事件
    calcBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updateBMIAndPlan();
    });
    
    // 附加: 实时校验输入框内容避免负号或者奇怪字符，但由parseFloat保障
    // 增加输入框防呆 (不允许负值，如果输入负值清空前端提示但计算时会提示错误)
    function sanitizeNumberInput(inputEl) {
        inputEl.addEventListener('change', function() {
            let val = parseFloat(this.value);
            if (isNaN(val)) {
                this.value = '';
            } else if (val <= 0) {
                this.value = '';
            }
        });
    }
    sanitizeNumberInput(heightInput);
    sanitizeNumberInput(weightInput);
    
    setupEnterKey();
    initDefaultPreview();
})();
