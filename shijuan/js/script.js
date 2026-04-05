// ---------- 题库定义（题目与答案完全分离，支持数学/语文/英语）----------
// 每个科目返回 { questions: Array<string>, answers: Array<string> }
// 注意：题目HTML内不含题号（题号由渲染自动添加），包含完整题干及选项/分值

const subjectData = {
    math: {
        questions: [
            `<div><span style="font-weight:600;">【选择题】</span> 下列一元二次方程中，没有实数根的是（ ）<br>
                <ul class="choice-list"><li>A. x² - 2x = 0</li><li>B. x² + 4x + 5 = 0</li><li>C. 2x² - 3x + 1 = 0</li><li>D. x² - 6x + 9 = 0</li></ul>
                <div style="font-size:13px; color:#6c5d42;">(本题5分)</div></div>`,
            `<div><span style="font-weight:600;">【填空题】</span> 分解因式：a³ - 4a = ______________。<br>
                <div style="font-size:13px; color:#6c5d42;">(本题5分)</div></div>`,
            `<div><span style="font-weight:600;">【计算题】</span> 解分式方程：<span class="blank">$\frac{2}{x-1} = \frac{3}{x+1}$</span> (要求写出检验过程)<br>
                <div style="font-size:13px; color:#6c5d42;">(本题10分)</div></div>`,
            `<div><span style="font-weight:600;">【应用题】</span> 某商场将进价为30元的台灯以40元售出，平均每月能售出600个。调查表明：售价每上涨1元，其销售量就减少10个。为了实现平均每月10000元的销售利润，这种台灯的售价应定为多少元？<br>
                <div style="font-size:13px; color:#6c5d42;">(本题10分)</div></div>`,
            `<div><span style="font-weight:600;">【几何探究】</span> 如图，在△ABC中，∠C=90°，AC=6，BC=8，点D在BC上，且CD=2，求AD的长。<br>
                <div style="font-size:13px; color:#6c5d42;">(本题8分)</div></div>`
        ],
        answers: [
            `【答案】B<br>解析：B选项中Δ=16-20=-4<0，无实数根；A有实根；C有实根；D有等根。`,
            `【答案】a(a+2)(a-2)<br>解析：提公因式a，再利用平方差公式。`,
            `【答案】x=5<br>解析：去分母得2(x+1)=3(x-1) → 2x+2=3x-3 → -x=-5 → x=5，经检验x=5是原方程的解。`,
            `【答案】售价定为50元或80元。<br>解析：设涨价x元，则(40+x-30)(600-10x)=10000 → (10+x)(600-10x)=10000，解得x₁=10，x₂=40，售价50或80元。`,
            `【答案】AD = 2√10<br>解析：由勾股得AB=10，CD=2，则BD=6，在Rt△ACD中，AD=√(AC²+CD²)=√(36+4)=√40=2√10。`
        ]
    },
    chinese: {
        questions: [
            `<div><span style="font-weight:600;">【基础积累】</span> 下列词语中，加点字注音全部正确的一项是（ ）<br>
                <ul class="choice-list"><li>A. 粗犷(kuàng)  静谧(mì)</li><li>B. 莅临(wèi)    咄咄逼人(duō)</li><li>C. 应和(hè)     着落(zhuó)</li><li>D. 贮蓄(chǔ)    憔悴(qiáo)</li></ul>
                <div style="font-size:13px; color:#6c5d42;">(本题4分)</div></div>`,
            `<div><span style="font-weight:600;">【古诗文默写】</span> 补写出下列名句中的空缺部分。<br>
                ① 潮平两岸阔，_______________。（王湾《次北固山下》）<br>
                ② 夜阑卧听风吹雨，_______________。（陆游《十一月四日风雨大作》）<br>
                ③ 学而不思则罔，_______________。（《论语》）<br>
                <div style="font-size:13px; color:#6c5d42;">(每空2分，共6分)</div></div>`,
            `<div><span style="font-weight:600;">【文言文阅读】</span> 阅读《孙权劝学》，回答问题："孤岂欲卿治经为博士邪！但当涉猎，见往事耳。卿言多务，孰若孤？孤常读书，自以为大有所益。"<br>
                请翻译画线句子"但当涉猎，见往事耳"。<br>
                <div style="font-size:13px; color:#6c5d42;">(本题5分)</div></div>`,
            `<div><span style="font-weight:600;">【现代文阅读·素养】</span> "不必说碧绿的菜畦，光滑的石井栏，高大的皂荚树，紫红的桑椹；也不必说鸣蝉在树叶里长吟，肥胖的黄蜂伏在菜花上……"，这段文字出自哪篇散文？作者是谁？表达了怎样的情感？<br>
                <div style="font-size:13px; color:#6c5d42;">(本题5分)</div></div>`,
            `<div><span style="font-weight:600;">【写作表达】</span> 题目：《成长中的那束光》<br>要求：写一篇不少于400字的记叙文，有真情实感。<br>
                <div style="font-size:13px; color:#6c5d42;">(本题30分)</div></div>`
        ],
        answers: [
            `【答案】C<br>解析：A.粗犷(guǎng)；B.莅临(lì)；D.贮蓄(zhù)。C项全部正确。`,
            `【答案】①风正一帆悬；②铁马冰河入梦来；③思而不学则殆。<br>解析：考查课内古诗文及论语背诵。`,
            `【答案】只是应当粗略地阅读，了解历史罢了。<br>解析："但"译为"只"，"涉猎"指粗略阅读，"见往事"了解历史。`,
            `【答案】出自《从百草园到三味书屋》，作者鲁迅（周树人）。表达了作者对童年乐园的深深眷恋与怀念之情，以及对自然、自由生活的热爱。`,
            `【答案】作文评分标准（参考答案思路）：围绕"成长"与"光"象征意义（如亲情、友情、梦想等），记叙具体事例，情感真挚，结构完整，语言流畅。分值按等第给分。本题为开放性试题，言之成理即可。`
        ]
    },
    english: {
        questions: [
            `<div><span style="font-weight:600;">【单项选择】</span> — How do you study for a test?<br> — I study ______ working with a group.<br>
                <ul class="choice-list"><li>A. by</li><li>B. with</li><li>C. in</li><li>D. on</li></ul>
                <div style="font-size:13px; color:#6c5d42;">(本题3分)</div></div>`,
            `<div><span style="font-weight:600;">【完形填空·节选】</span> Tom is a middle school student. He always gets up early and ____ breakfast quickly. He likes reading English aloud every morning.<br>
                <ul class="choice-list"><li>A. have</li><li>B. has</li><li>C. having</li><li>D. to have</li></ul>
                <div style="font-size:13px; color:#6c5d42;">(本题3分)</div></div>`,
            `<div><span style="font-weight:600;">【阅读理解】</span> 阅读短文：Mary is a kind girl. She often helps her classmates with their homework. Last week, she found a wallet on the playground and gave it to the teacher. The owner was very thankful.<br>
                问题：What did Mary find on the playground?<br>
                <div style="font-size:13px; color:#6c5d42;">(本题4分)</div></div>`,
            `<div><span style="font-weight:600;">【句型转换】</span> She often does her homework at 7 PM. (改为否定句)<br>
                <div style="font-size:13px; color:#6c5d42;">(本题4分)</div></div>`,
            `<div><span style="font-weight:600;">【书面表达】</span> 假设你是李华，请给你的笔友Tom写一封电子邮件，介绍你最喜欢的科目以及原因（60词左右）。<br>
                <div style="font-size:13px; color:#6c5d42;">(本题16分)</div></div>`
        ],
        answers: [
            `【答案】A<br>解析：by+doing 表示"通过……方式"。`,
            `【答案】B<br>解析：主语He为第三人称单数，一般现在时用has。`,
            `【答案】She found a wallet.<br>解析：原文信息"she found a wallet on the playground"。`,
            `【答案】She doesn't often do her homework at 7 PM.<br>解析：含有实义动词does的否定借助doesn't，动词恢复原形。`,
            `【答案】参考范文：Dear Tom, My favorite subject is science because it's interesting and full of experiments. I learn many new things every day. What about you? Yours, Li Hua.<br>（内容完整、语法正确即可）`
        ]
    }
};

// 辅助函数：渲染试卷（题目和答案完全分开区域独立渲染）
function renderExam(subjectKey) {
    const data = subjectData[subjectKey];
    if (!data) return;

    const questionsArr = data.questions;
    const answersArr = data.answers;

    // 生成题目区域 HTML （带题号与分值样式，不混杂答案）
    let questionsHtml = '';
    questionsArr.forEach((qHtml, idx) => {
        const qNumber = idx + 1;
        // 添加题号包装，显示更清晰
        questionsHtml += `
                <div class="question-item">
                    <div class="q-title">${qNumber}.</div>
                    <div class="q-content">
                        ${qHtml}
                    </div>
                </div>
            `;
    });
    if (questionsArr.length === 0) questionsHtml = '<div style="padding:20px; text-align:center;">暂无试题数据</div>';

    // 动态修改区域标题，增加科目感
    let subjectChinese = '';
    if (subjectKey === 'math') subjectChinese = '数学';
    else if (subjectKey === 'chinese') subjectChinese = '语文';
    else subjectChinese = '英语';

    // 更新试卷头部考试科目副标题（可选）
    const examTitleH1 = document.querySelector('.exam-title h1');
    if (examTitleH1) {
        let baseTitle = '2024~2025学年第二学期期中检测卷';
        if (subjectKey === 'math') baseTitle = '数学·2024~2025学年第二学期期中检测卷';
        else if (subjectKey === 'chinese') baseTitle = '语文·2024~2025学年第二学期期中检测卷';
        else baseTitle = '英语·2024~2025学年第二学期期中检测卷';
        examTitleH1.innerText = baseTitle;
    }

    // 注入题目区域
    const questionsListDiv = document.getElementById('questionsList');
    if (questionsListDiv) {
        questionsListDiv.innerHTML = questionsHtml;
    }

    // 生成答案区域 HTML (独立生成，不与题目混合)
    let answersHtml = '<div class="answer-list">';
    answersArr.forEach((ans, idx) => {
        const aNumber = idx + 1;
        answersHtml += `
                <div class="answer-item">
                    <span class="answer-num">${aNumber}</span>
                    <div class="answer-text">${ans}</div>
                </div>
            `;
    });
    answersHtml += '</div>';
    if (answersArr.length === 0) answersHtml = '<div style="padding:20px; text-align:center;">参考答案待生成</div>';

    const answersListDiv = document.getElementById('answersList');
    if (answersListDiv) {
        answersListDiv.innerHTML = answersHtml;
    }

    // 额外优化一下题目内特殊字符渲染（数学公式简单处理一下，仅做文本显示友好）
    // 因为题干里可能带 $...$，由于不需要复杂公式库，直接转为普通文本样式
    // 但是为显示正确，把$...$转为斜体标记
    const qContents = document.querySelectorAll('.q-content');
    qContents.forEach(el => {
        let inner = el.innerHTML;
        inner = inner.replace(/\$(.*?)\$/g, '<span style="font-family: monospace; background:#f3f0e2; padding:0 4px;">$1</span>');
        el.innerHTML = inner;
    });
}

// 切换/生成主函数
function generatePaper() {
    const subjectSelect = document.getElementById('subjectSelect');
    const subject = subjectSelect.value;
    renderExam(subject);
}

// 页面初始化加载默认数学试卷
document.addEventListener('DOMContentLoaded', () => {
    // 默认数学
    renderExam('math');

    // 绑定生成按钮
    const genBtn = document.getElementById('generateBtn');
    if (genBtn) {
        genBtn.addEventListener('click', generatePaper);
    }

    // 可选：下拉改变时自动生成（更符合直觉，但不影响分开生成规范）
    const subSelect = document.getElementById('subjectSelect');
    if (subSelect) {
        subSelect.addEventListener('change', () => {
            generatePaper();
        });
    }
});
