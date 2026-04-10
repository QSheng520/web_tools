// --------------------------------------------------------------
// 1. 丰富完整的 emoji 数据集 (8大分类，总计240+常用表情)
// --------------------------------------------------------------
const EMOJIS_DATA = [];

// 辅助添加分类
function addEmoji(category, list) {
    list.forEach(item => {
        EMOJIS_DATA.push({
            emoji: item.emoji,
            name: item.name,
            category: category
        });
    });
}

// ========= 1. 笑脸 & 人物 (Smileys & People) =========
const smileys = [
    { emoji: "😀", name: "咧嘴大笑" }, { emoji: "😃", name: "开心大笑" }, { emoji: "😄", name: "眯眼笑" },
    { emoji: "😁", name: "露齿笑" }, { emoji: "😆", name: "开怀笑" }, { emoji: "😅", name: "尴尬汗笑" },
    { emoji: "😂", name: "笑哭" }, { emoji: "🤣", name: "笑到流泪" }, { emoji: "🥲", name: "含泪微笑" },
    { emoji: "🙂", name: "微微笑" }, { emoji: "🙃", name: "倒脸" }, { emoji: "😉", name: "眨眼" },
    { emoji: "😊", name: "害羞笑" }, { emoji: "😇", name: "天使光环" }, { emoji: "🥰", name: "爱心环绕" },
    { emoji: "😍", name: "心心眼" }, { emoji: "🤩", name: "星星眼" }, { emoji: "😘", name: "飞吻" },
    { emoji: "😗", name: "亲吻" }, { emoji: "😚", name: "闭眼亲" }, { emoji: "😙", name: "开心亲" },
    { emoji: "😋", name: "好吃" }, { emoji: "😛", name: "吐舌头" }, { emoji: "😜", name: "搞怪眨眼" },
    { emoji: "🤪", name: "疯狂怪脸" }, { emoji: "😝", name: "眯眼吐舌" }, { emoji: "🤑", name: "金钱眼" },
    { emoji: "🤗", name: "拥抱" }, { emoji: "🤭", name: "捂嘴笑" }, { emoji: "🤫", name: "嘘声" },
    { emoji: "🤔", name: "思考" }, { emoji: "🤐", name: "闭嘴" }, { emoji: "😐", name: "中性脸" },
    { emoji: "😑", name: "无言" }, { emoji: "😶", name: "沉默" }, { emoji: "😏", name: "得意" },
    { emoji: "😒", name: "不满" }, { emoji: "🙄", name: "翻白眼" }, { emoji: "😬", name: "牙痛" },
    { emoji: "🤥", name: "说谎长鼻" }, { emoji: "😌", name: "释然" }, { emoji: "😔", name: "失落" },
    { emoji: "😪", name: "瞌睡" }, { emoji: "🤤", name: "流口水" }, { emoji: "😴", name: "睡觉" },
    { emoji: "😷", name: "戴口罩" }, { emoji: "🤒", name: "体温计" }, { emoji: "🤕", name: "绷带伤" },
    { emoji: "🤢", name: "恶心" }, { emoji: "🤮", name: "呕吐" }, { emoji: "🤧", name: "打喷嚏" },
    { emoji: "🥵", name: "炎热" }, { emoji: "🥶", name: "冰冷" }, { emoji: "🥴", name: "醉晕" },
    { emoji: "😵", name: "头晕" }, { emoji: "🤯", name: "爆炸头" }, { emoji: "🤠", name: "牛仔" },
    { emoji: "🥳", name: "派对" }, { emoji: "😎", name: "酷墨镜" }, { emoji: "🤓", name: "书呆子" },
    { emoji: "🧐", name: "单眼镜" }, { emoji: "😕", name: "困惑" }, { emoji: "😟", name: "担忧" },
    { emoji: "🙁", name: "微难过" }, { emoji: "☹️", name: "皱眉" }, { emoji: "😮", name: "惊讶" },
    { emoji: "😯", name: "静默惊" }, { emoji: "😲", name: "目瞪口呆" }, { emoji: "😳", name: "脸红" },
    { emoji: "🥺", name: "恳求脸" }, { emoji: "😢", name: "哭泣" }, { emoji: "😭", name: "嚎啕大哭" },
    { emoji: "😱", name: "惊恐尖叫" }, { emoji: "😖", name: "沮丧" }, { emoji: "😣", name: "忍耐" },
    { emoji: "😞", name: "失望" }, { emoji: "😓", name: "冷汗" }, { emoji: "😩", name: "疲惫" },
    { emoji: "😫", name: "累哭" }, { emoji: "🥱", name: "打哈欠" }, { emoji: "😤", name: "冒气" },
    { emoji: "😡", name: "生气" }, { emoji: "😠", name: "愤怒" }, { emoji: "🤬", name: "脏话" },
    { emoji: "😈", name: "笑脸恶魔" }, { emoji: "👿", name: "怒恶魔" }, { emoji: "💀", name: "骷髅" },
    { emoji: "👻", name: "幽灵" }, { emoji: "🤡", name: "小丑" }, { emoji: "👽", name: "外星人" },
    { emoji: "🤖", name: "机器人" }, { emoji: "💩", name: "便便" }, { emoji: "😺", name: "微笑猫" },
    // 扩充笑脸
    { emoji: "🙈", name: "不看猴" }, { emoji: "🙉", name: "不听猴" }, { emoji: "🙊", name: "不说猴" },
    { emoji: "💋", name: "唇印" }, { emoji: "💌", name: "情书" }, { emoji: "💘", name: "爱心射中" },
    { emoji: "💝", name: "礼物心" }, { emoji: "💖", name: "闪烁心" }, { emoji: "💗", name: "成长心" },
    { emoji: "💓", name: "跳动心" }, { emoji: "💞", name: "旋转心" }, { emoji: "💕", name: "双心" },
    { emoji: "💟", name: "心形装饰" }, { emoji: "❣️", name: "心形感叹号" }, { emoji: "💤", name: "睡觉Zzz" },
    { emoji: "💦", name: "汗滴" }, { emoji: "💨", name: "冲刺" }, { emoji: "🕳️", name: "洞" },
    { emoji: "💣", name: "炸弹" }, { emoji: "🔪", name: "刀" }, { emoji: "🏹", name: "弓箭" }
];
addEmoji("smileys", smileys);

// ========= 1.5 人物角色 (People Roles) =========
const peopleRoles = [
    { emoji: "👮", name: "警察" }, { emoji: "👮‍♂️", name: "男警察" }, { emoji: "👮‍♀️", name: "女警察" },
    { emoji: "🕵️", name: "侦探" }, { emoji: "🕵️‍♂️", name: "男侦探" }, { emoji: "🕵️‍♀️", name: "女侦探" },
    { emoji: "🦹", name: "超级反派" }, { emoji: "🦹‍♂️", name: "男反派" }, { emoji: "🦹‍♀️", name: "女反派" },
    { emoji: "🦸", name: "超级英雄" }, { emoji: "🦸‍♂️", name: "男英雄" }, { emoji: "🦸‍♀️", name: "女英雄" },
    { emoji: "🥷", name: "忍者" }, { emoji: "🧙", name: "魔法师" }, { emoji: "🧙‍♂️", name: "男魔法师" },
    { emoji: "🧙‍♀️", name: "女魔法师" }, { emoji: "🧚", name: "精灵" }, { emoji: "🧚‍♂️", name: "男精灵" },
    { emoji: "🧚‍♀️", name: "女精灵" }, { emoji: "🧛", name: "吸血鬼" }, { emoji: "🧛‍♂️", name: "男吸血鬼" },
    { emoji: "🧛‍♀️", name: "女吸血鬼" }, { emoji: "🧜", name: "美人鱼" }, { emoji: "🧜‍♂️", name: "人鱼王子" },
    { emoji: "🧜‍♀️", name: "美人鱼公主" }, { emoji: "🧝", name: "小矮人" }, { emoji: "🧝‍♂️", name: "男小矮人" },
    { emoji: "🧝‍♀️", name: "女小矮人" }, { emoji: "👷", name: "建筑工人" }, { emoji: "👷‍♂️", name: "男建筑工" },
    { emoji: "👷‍♀️", name: "女建筑工" }, { emoji: "💂", name: "卫兵" }, { emoji: "💂‍♂️", name: "男卫兵" },
    { emoji: "💂‍♀️", name: "女卫兵" }, { emoji: "👩‍⚕️", name: "女医生" }, { emoji: "👨‍⚕️", name: "男医生" },
    { emoji: "👩‍🎓", name: "女学生" }, { emoji: "👨‍🎓", name: "男学生" }, { emoji: "👩‍🏫", name: "女教师" },
    { emoji: "👨‍🏫", name: "男教师" }, { emoji: "👩‍⚖️", name: "女法官" }, { emoji: "👨‍⚖️", name: "男法官" },
    { emoji: "👩‍🌾", name: "女农民" }, { emoji: "👨‍🌾", name: "男农民" }, { emoji: "👩‍🍳", name: "女厨师" },
    { emoji: "👨‍🍳", name: "男厨师" }, { emoji: "👩‍🔧", name: "女技工" }, { emoji: "👨‍🔧", name: "男技工" },
    { emoji: "👩‍🏭", name: "女工人" }, { emoji: "👨‍🏭", name: "男工人" }, { emoji: "👩‍💼", name: "女白领" },
    { emoji: "👨‍💼", name: "男白领" }, { emoji: "👩‍🔬", name: "女科学家" }, { emoji: "👨‍🔬", name: "男科学家" },
    { emoji: "👩‍💻", name: "女程序员" }, { emoji: "👨‍💻", name: "男程序员" }, { emoji: "👩‍🎤", name: "女歌手" },
    { emoji: "👨‍🎤", name: "男歌手" }, { emoji: "👩‍🎨", name: "女艺术家" }, { emoji: "👨‍🎨", name: "男艺术家" },
    { emoji: "👩‍✈️", name: "女飞行员" }, { emoji: "👨‍✈️", name: "男飞行员" }, { emoji: "👩‍🚀", name: "女宇航员" },
    { emoji: "👨‍🚀", name: "男宇航员" }, { emoji: "👩‍🚒", name: "女消防员" }, { emoji: "👨‍🚒", name: "男消防员" },
    { emoji: "🤴", name: "王子" }, { emoji: "👸", name: "公主" }, { emoji: "👳", name: "戴头巾的人" },
    { emoji: "👳‍♂️", name: "戴头巾的男人" }, { emoji: "👳‍♀️", name: "戴头巾的女人" }, { emoji: "👲", name: "戴帽子的中国人" },
    { emoji: "🧕", name: "戴头巾的女人" }, { emoji: "🤵", name: "穿燕尾服的人" }, { emoji: "🤵‍♂️", name: "新郎" },
    { emoji: "🤵‍♀️", name: "穿礼服的女人" }, { emoji: "👰", name: "新娘" }, { emoji: "👰‍♂️", name: "戴面纱的男人" },
    { emoji: "👰‍♀️", name: "戴面纱的女人" }, { emoji: "🤰", name: "孕妇" }, { emoji: "🤱", name: "母乳喂养" },
    { emoji: "👼", name: "天使宝宝" }, { emoji: "🎅", name: "圣诞老人" }, { emoji: "🤶", name: "圣诞奶奶" },
    { emoji: "🦹", name: "小偷" }, { emoji: "🧟", name: "僵尸" },
    { emoji: "🧟‍♂️", name: "男僵尸" }, { emoji: "🧟‍♀️", name: "女僵尸" }
];
addEmoji("peopleRoles", peopleRoles);

// ========= 2. 动物 & 自然 =========
const animals = [
    { emoji: "🐶", name: "狗脸" }, { emoji: "🐱", name: "猫脸" }, { emoji: "🐭", name: "老鼠" }, { emoji: "🐹", name: "仓鼠" },
    { emoji: "🐰", name: "兔子" }, { emoji: "🦊", name: "狐狸" }, { emoji: "🐻", name: "熊" }, { emoji: "🐼", name: "熊猫" },
    { emoji: "🐨", name: "考拉" }, { emoji: "🐯", name: "老虎" }, { emoji: "🦁", name: "狮子" }, { emoji: "🐮", name: "牛" },
    { emoji: "🐷", name: "猪" }, { emoji: "🐸", name: "青蛙" }, { emoji: "🐵", name: "猴脸" }, { emoji: "🐒", name: "猴子" },
    { emoji: "🐔", name: "鸡" }, { emoji: "🐧", name: "企鹅" }, { emoji: "🐦", name: "鸟" }, { emoji: "🐤", name: "小鸡" },
    { emoji: "🐥", name: "幼鸡" }, { emoji: "🐺", name: "狼" }, { emoji: "🐗", name: "野猪" }, { emoji: "🐴", name: "马" },
    { emoji: "🦄", name: "独角兽" }, { emoji: "🐝", name: "蜜蜂" }, { emoji: "🐛", name: "毛毛虫" }, { emoji: "🦋", name: "蝴蝶" },
    { emoji: "🐌", name: "蜗牛" }, { emoji: "🐞", name: "瓢虫" }, { emoji: "🐜", name: "蚂蚁" }, { emoji: "🦟", name: "蚊子" },
    { emoji: "🦗", name: "蟋蟀" }, { emoji: "🕷️", name: "蜘蛛" }, { emoji: "🦂", name: "蝎子" }, { emoji: "🐢", name: "乌龟" },
    { emoji: "🐍", name: "蛇" }, { emoji: "🦎", name: "蜥蜴" }, { emoji: "🐙", name: "章鱼" }, { emoji: "🦑", name: "鱿鱼" },
    { emoji: "🦐", name: "虾" }, { emoji: "🦞", name: "龙虾" }, { emoji: "🐠", name: "热带鱼" }, { emoji: "🐟", name: "鱼" },
    { emoji: "🐬", name: "海豚" }, { emoji: "🐳", name: "鲸鱼" }, { emoji: "🐋", name: "巨鲸" }, { emoji: "🦈", name: "鲨鱼" },
    { emoji: "🌵", name: "仙人掌" }, { emoji: "🌸", name: "樱花" }, { emoji: "🌻", name: "向日葵" }, { emoji: "🍂", name: "落叶" },
    { emoji: "☀️", name: "太阳" }, { emoji: "⭐", name: "星星" }, { emoji: "🌙", name: "月亮" }, { emoji: "🌎", name: "地球美洲" },
    { emoji: "🌍", name: "地球欧非" }, { emoji: "🌏", name: "地球亚洲" }, { emoji: "🌑", name: "新月" }, { emoji: "🌒", name: "娥眉月" },
    { emoji: "🌓", name: "上弦月" }, { emoji: "🌔", name: "盈凸月" }, { emoji: "🌕", name: "满月" }, { emoji: "🌖", name: "亏凸月" },
    { emoji: "🌗", name: "下弦月" }, { emoji: "🌘", name: "残月" }, { emoji: "🌝", name: "满月脸" }, { emoji: "🌞", name: "太阳脸" },
    { emoji: "🐉", name: "龙" }, { emoji: "🐲", name: "龙头" }, { emoji: "🦕", name: "雷龙" }, { emoji: "🦖", name: "霸王龙" }
];
addEmoji("animals", animals);

// ========= 3. 食物 & 饮料 =========
const foods = [
    { emoji: "🍎", name: "苹果" }, { emoji: "🍐", name: "梨" }, { emoji: "🍊", name: "橘子" }, { emoji: "🍋", name: "柠檬" },
    { emoji: "🍌", name: "香蕉" }, { emoji: "🍉", name: "西瓜" }, { emoji: "🍇", name: "葡萄" }, { emoji: "🍓", name: "草莓" },
    { emoji: "🫐", name: "蓝莓" }, { emoji: "🍒", name: "樱桃" }, { emoji: "🥝", name: "奇异果" }, { emoji: "🍅", name: "番茄" },
    { emoji: "🥑", name: "牛油果" }, { emoji: "🍆", name: "茄子" }, { emoji: "🥔", name: "土豆" }, { emoji: "🥕", name: "胡萝卜" },
    { emoji: "🌽", name: "玉米" }, { emoji: "🥦", name: "西兰花" }, { emoji: "🍔", name: "汉堡" }, { emoji: "🍟", name: "薯条" },
    { emoji: "🍕", name: "披萨" }, { emoji: "🌭", name: "热狗" }, { emoji: "🥪", name: "三明治" }, { emoji: "🍚", name: "米饭" },
    { emoji: "🍣", name: "寿司" }, { emoji: "🍜", name: "拉面" }, { emoji: "🍦", name: "冰淇淋" }, { emoji: "🍩", name: "甜甜圈" },
    { emoji: "🍪", name: "饼干" }, { emoji: "☕", name: "热饮" }, { emoji: "🍺", name: "啤酒" }, { emoji: "🥂", name: "干杯" },
    { emoji: "🍷", name: "红酒" }, { emoji: "🥛", name: "一杯牛奶" }, { emoji: "🧋", name: "珍珠奶茶" }, { emoji: "🍵", name: "抹茶" },
    { emoji: "🧃", name: "果汁盒" }, { emoji: "🥤", name: "杯装饮料" }, { emoji: "🍶", name: "清酒" }, { emoji: "🍾", name: "开瓶香槟" },
    { emoji: "🥞", name: "松饼" }, { emoji: "🧁", name: "纸杯蛋糕" }, { emoji: "🍰", name: "蛋糕" }, { emoji: "🎂", name: "生日蛋糕" },
    { emoji: "🍬", name: "糖果" }, { emoji: "🍭", name: "棒棒糖" }, { emoji: "🍫", name: "巧克力" }, { emoji: "🍿", name: "爆米花" }
];
addEmoji("food", foods);

// ========= 4. 旅行 & 地点 =========
const travels = [
    { emoji: "🚗", name: "汽车" }, { emoji: "🚕", name: "出租车" }, { emoji: "🚌", name: "公交车" }, { emoji: "🚲", name: "自行车" },
    { emoji: "✈️", name: "飞机" }, { emoji: "🚀", name: "火箭" }, { emoji: "🚁", name: "直升机" }, { emoji: "⛵", name: "帆船" },
    { emoji: "🏖️", name: "海滩" }, { emoji: "🏔️", name: "雪山" }, { emoji: "🗽", name: "自由女神" }, { emoji: "🏯", name: "日本城堡" },
    { emoji: "🎡", name: "摩天轮" }, { emoji: "🌋", name: "火山" }, { emoji: "🌈", name: "彩虹" }, { emoji: "🌍", name: "地球" },
    { emoji: "🚄", name: "高铁" }, { emoji: "🚅", name: "子弹列车" }, { emoji: "🚇", name: "地铁" }, { emoji: "🚊", name: "电车" },
    { emoji: "🚤", name: "快艇" }, { emoji: "🛳️", name: "渡轮" }, { emoji: "⛴️", name: "大型渡轮" }, { emoji: "🛩️", name: "小飞机" },
    { emoji: "🪂", name: "降落伞" }, { emoji: "🏰", name: "城堡" }, { emoji: "🗼", name: "东京塔" }, { emoji: "🏟️", name: "体育场" },
    { emoji: "🎢", name: "过山车" }, { emoji: "🏝️", name: "荒岛" }, { emoji: "⛰️", name: "高山" }, { emoji: "🏜️", name: "沙漠" }
];
addEmoji("travel", travels);

// ========= 5. 活动 =========
const activities = [
    { emoji: "⚽", name: "足球" }, { emoji: "🏀", name: "篮球" }, { emoji: "🏈", name: "橄榄球" }, { emoji: "⚾", name: "棒球" },
    { emoji: "🎾", name: "网球" }, { emoji: "🏐", name: "排球" }, { emoji: "🎮", name: "电子游戏" }, { emoji: "🎲", name: "骰子" },
    { emoji: "🎯", name: "靶心" }, { emoji: "🎳", name: "保龄球" }, { emoji: "🎤", name: "麦克风" }, { emoji: "🎧", name: "耳机" },
    { emoji: "🎸", name: "吉他" }, { emoji: "🎹", name: "钢琴" }, { emoji: "🎭", name: "戏剧" }, { emoji: "🎨", name: "艺术" },
    { emoji: "🏆", name: "奖杯" }, { emoji: "🥇", name: "金牌" }, { emoji: "🥈", name: "银牌" }, { emoji: "🥉", name: "铜牌" },
    { emoji: "🎽", name: "运动背心" }, { emoji: "🕹️", name: "游戏摇杆" }, { emoji: "🎲", name: "骰子" }, { emoji: "♟️", name: "国际象棋" },
    { emoji: "🎱", name: "台球" }, { emoji: "🏓", name: "乒乓球" }, { emoji: "🥊", name: "拳击手套" }, { emoji: "🥋", name: "武术道服" }
];
addEmoji("activities", activities);

// ========= 6. 物体 =========
const objects = [
    { emoji: "⌚", name: "手表" }, { emoji: "📱", name: "手机" }, { emoji: "💻", name: "笔记本电脑" }, { emoji: "⌨️", name: "键盘" },
    { emoji: "🖥️", name: "电脑" }, { emoji: "🖨️", name: "打印机" }, { emoji: "📷", name: "相机" }, { emoji: "📺", name: "电视" },
    { emoji: "💡", name: "灯泡" }, { emoji: "🔦", name: "手电筒" }, { emoji: "📚", name: "书本" }, { emoji: "✏️", name: "铅笔" },
    { emoji: "📎", name: "回形针" }, { emoji: "🔒", name: "锁" }, { emoji: "🔑", name: "钥匙" }, { emoji: "🧸", name: "泰迪熊" },
    { emoji: "🎁", name: "礼物" }, { emoji: "🪞", name: "镜子" }, { emoji: "🪟", name: "窗户" }, { emoji: "🧹", name: "扫帚" },
    { emoji: "🧺", name: "洗衣篮" }, { emoji: "🧻", name: "卷纸" }, { emoji: "🚰", name: "饮用水" }, { emoji: "🛀", name: "沐浴" },
    { emoji: "🪒", name: "剃须刀" }, { emoji: "🧴", name: "乳液瓶" }, { emoji: "🧷", name: "别针" }, { emoji: "🧩", name: "拼图" }
];
addEmoji("objects", objects);

// ========= 6.5 办公用品 (Office Supplies) =========
const officeSupplies = [
    { emoji: "📄", name: "文档" }, { emoji: "📃", name: "带摘要的文档" }, { emoji: "📑", name: "书签标签" },
    { emoji: "📊", name: "柱状图" }, { emoji: "📈", name: "上升趋势图" }, { emoji: "📉", name: "下降趋势图" },
    { emoji: "📋", name: "剪贴板" }, { emoji: "📁", name: "文件夹" }, { emoji: "📂", name: "打开的文件夹" },
    { emoji: "🗂️", name: "卡片索引分隔卡" }, { emoji: "🗃️", name: "卡片文件盒" }, { emoji: "🗄️", name: "文件柜" },
    { emoji: "📅", name: "日历" }, { emoji: "📆", name: "撕页日历" }, { emoji: "🗒️", name: "螺旋记事本" },
    { emoji: "🗓️", name: "螺旋日历" }, { emoji: "📇", name: "卡片索引" }, { emoji: "📈", name: "图表上升" },
    { emoji: "📉", name: "图表下降" }, { emoji: "📊", name: "条形图" }, { emoji: "📋", name: "写字板" },
    { emoji: "📌", name: "图钉" }, { emoji: "📍", name: "圆头图钉" }, { emoji: "📎", name: "回形针" },
    { emoji: "🖇️", name: "链接的回形针" }, { emoji: "📏", name: "直尺" }, { emoji: "📐", name: "三角尺" },
    { emoji: "✂️", name: "剪刀" }, { emoji: "🗑️", name: "废纸篓" }, { emoji: "🔏", name: "带锁的日记本" },
    { emoji: "🔐", name: "带钥匙的锁" }, { emoji: "🔓", name: "打开的锁" }, { emoji: "🖊️", name: "钢笔" },
    { emoji: "🖋️", name: " fountain pen" }, { emoji: "✒️", name: "黑色笔尖" }, { emoji: "🖌️", name: "画笔" },
    { emoji: "🖍️", name: "蜡笔" }, { emoji: "📝", name: "备忘录" }, { emoji: "💼", name: "公文包" },
    { emoji: "📂", name: "档案夹" }, { emoji: "📁", name: "文件夹关闭" }, { emoji: "🗂️", name: "索引分隔卡" },
    { emoji: "📑", name: "标签页" }, { emoji: "📰", name: "报纸" }, { emoji: "🗞️", name: "卷起的报纸" },
    { emoji: "📓", name: "笔记本" }, { emoji: "📔", name: "装饰笔记本" }, { emoji: "📒", name: "账本" },
    { emoji: "📕", name: "合上的书" }, { emoji: "📗", name: "绿皮书" }, { emoji: "📘", name: "蓝皮书" },
    { emoji: "📙", name: "橙皮书" }, { emoji: "📖", name: "打开的书" }, { emoji: "🔖", name: "书签" }
];
addEmoji("officeSupplies", officeSupplies);

// ========= 7. 符号 =========
const symbols = [
    { emoji: "❤️", name: "红心" }, { emoji: "🧡", name: "橙心" }, { emoji: "💛", name: "黄心" }, { emoji: "💚", name: "绿心" },
    { emoji: "💙", name: "蓝心" }, { emoji: "💜", name: "紫心" }, { emoji: "🖤", name: "黑心" }, { emoji: "💔", name: "心碎" },
    { emoji: "💯", name: "百分百" }, { emoji: "❗", name: "感叹号" }, { emoji: "❓", name: "问号" }, { emoji: "♻️", name: "回收" },
    { emoji: "⚜️", name: "鸢尾花" }, { emoji: "®️", name: "注册" }, { emoji: "©️", name: "版权" }, { emoji: "™️", name: "商标" },
    { emoji: "🔞", name: "18禁" }, { emoji: "🈲", name: "禁止" }, { emoji: "🉑", name: "可接受" }, { emoji: "🈳", name: "空" },
    { emoji: "🈴", name: "合格" }, { emoji: "🈶", name: "有" }, { emoji: "🈚", name: "无" }, { emoji: "🆗", name: "OK" },
    { emoji: "🆚", name: "VS" }, { emoji: "🆒", name: "酷" }, { emoji: "🆕", name: "新" }, { emoji: "🆖", name: "NG" },
    { emoji: "♈", name: "白羊座" }, { emoji: "♉", name: "金牛座" }, { emoji: "♊", name: "双子座" }, { emoji: "♋", name: "巨蟹座" },
    { emoji: "♌", name: "狮子座" }, { emoji: "♍", name: "处女座" }, { emoji: "♎", name: "天秤座" }, { emoji: "♏", name: "天蝎座" },
    { emoji: "♐", name: "射手座" }, { emoji: "♑", name: "摩羯座" }, { emoji: "♒", name: "水瓶座" }, { emoji: "♓", name: "双鱼座" }
];
addEmoji("symbols", symbols);

// ========= 8. 旗帜 =========
const flags = [
    { emoji: "🏁", name: "方格旗" }, { emoji: "🚩", name: "三角旗" }, { emoji: "🎌", name: "交叉旗" }, { emoji: "🇨🇳", name: "中国" },
    { emoji: "🇺🇸", name: "美国" }, { emoji: "🇯🇵", name: "日本" }, { emoji: "🇰🇷", name: "韩国" }, { emoji: "🇬🇧", name: "英国" },
    { emoji: "🇫🇷", name: "法国" }, { emoji: "🇩🇪", name: "德国" }, { emoji: "🇮🇹", name: "意大利" }, { emoji: "🇷🇺", name: "俄罗斯" },
    { emoji: "🇨🇦", name: "加拿大" }, { emoji: "🇦🇺", name: "澳大利亚" }, { emoji: "🇧🇷", name: "巴西" }, { emoji: "🇮🇳", name: "印度" }
];
addEmoji("flags", flags);

// ========= 9. 新增: 服饰 & 配饰 =========
const clothing = [
    { emoji: "👕", name: "T恤" }, { emoji: "👖", name: "牛仔裤" }, { emoji: "👗", name: "连衣裙" }, { emoji: "👘", name: "和服" },
    { emoji: "🥻", name: "纱丽" }, { emoji: "🩱", name: "泳衣" }, { emoji: "🩲", name: "泳裤" }, { emoji: "🩳", name: "短裤" },
    { emoji: "👙", name: "比基尼" }, { emoji: "👚", name: "女装" }, { emoji: "👛", name: "钱包" }, { emoji: "👜", name: "手提包" },
    { emoji: "👝", name: "手包" }, { emoji: "🛍️", name: "购物袋" }, { emoji: "🎒", name: "书包" }, { emoji: "👞", name: "男鞋" },
    { emoji: "👟", name: "运动鞋" }, { emoji: "🥾", name: "登山靴" }, { emoji: "🥿", name: "平底鞋" }, { emoji: "👠", name: "高跟鞋" },
    { emoji: "👡", name: "凉鞋" }, { emoji: "👢", name: "长靴" }, { emoji: "👑", name: "王冠" }, { emoji: "👒", name: "帽子" },
    { emoji: "🎩", name: "礼帽" }, { emoji: "🧢", name: "棒球帽" }, { emoji: "🧣", name: "围巾" }, { emoji: "🧤", name: "手套" }
];
addEmoji("clothing", clothing);

// ========= 10. 新增: 天气 & 时间 =========
const weather = [
    { emoji: "🌡️", name: "温度计" }, { emoji: "☀️", name: "晴天" }, { emoji: "☁️", name: "多云" }, { emoji: "⛅", name: "晴转多云" },
    { emoji: "🌤️", name: "少云" }, { emoji: "🌥️", name: "多云间晴" }, { emoji: "🌦️", name: "小雨转晴" }, { emoji: "🌧️", name: "雨天" },
    { emoji: "⛈️", name: "雷雨" }, { emoji: "🌩️", name: "雷电" }, { emoji: "🌨️", name: "雪天" }, { emoji: "❄️", name: "雪花" },
    { emoji: "☃️", name: "雪人" }, { emoji: "⛄", name: "雪人无雪" }, { emoji: "🌫️", name: "雾天" }, { emoji: "💨", name: "大风" },
    { emoji: "🕐", name: "一点钟" }, { emoji: "🕑", name: "两点钟" }, { emoji: "🕒", name: "三点钟" }, { emoji: "⏰", name: "闹钟" },
    { emoji: "⏲️", name: "计时器" }, { emoji: "⌛", name: "沙漏" }, { emoji: "⏳", name: "流动沙漏" }, { emoji: "📅", name: "日历" }
];
addEmoji("weather", weather);

// ========= 11. 新增: 乐器 & 音乐 =========
const music = [
    { emoji: "🎵", name: "音符" }, { emoji: "🎶", name: "多音符" }, { emoji: "🎙️", name: "麦克风" }, { emoji: "🎚️", name: "推子" },
    { emoji: "🎛️", name: "调音台" }, { emoji: "🎷", name: "萨克斯" }, { emoji: "🎺", name: "小号" }, { emoji: "🎸", name: "吉他" },
    { emoji: "🪕", name: "班卓琴" }, { emoji: "🎻", name: "小提琴" }, { emoji: "🥁", name: "鼓" }, { emoji: "🪘", name: "长鼓" }
];
addEmoji("music", music);

// ========= 12. 新增: 金钱 & 金融 =========
const money = [
    { emoji: "💰", name: "钱袋" }, { emoji: "💴", name: "日元钞票" }, { emoji: "💵", name: "美元钞票" }, { emoji: "💶", name: "欧元钞票" },
    { emoji: "💷", name: "英镑钞票" }, { emoji: "💸", name: "飞钱" }, { emoji: "💳", name: "信用卡" }, { emoji: "🧾", name: "收据" },
    { emoji: "💹", name: "股市上涨" }, { emoji: "💱", name: "货币兑换" }, { emoji: "💲", name: "美元符号" }, { emoji: "🪙", name: "硬币" },
    { emoji: "🏦", name: "银行" }, { emoji: "💎", name: "钻石" }, { emoji: "⚖️", name: "天平" }, { emoji: "🪙", name: "金币" }
];
addEmoji("money", money);

// ========= 13. 新增: 学校 & 教育 =========
const school = [
    { emoji: "🏫", name: "学校" }, { emoji: "🏛️", name: "大学建筑" }, { emoji: "📚", name: "书籍" }, { emoji: "📖", name: "打开的书" },
    { emoji: "📝", name: "考试卷" }, { emoji: "✏️", name: "铅笔" }, { emoji: "🖊️", name: "钢笔" }, { emoji: "🖋️", name: "毛笔" },
    { emoji: "🎒", name: "书包" }, { emoji: "👩‍🎓", name: "女毕业生" }, { emoji: "👨‍🎓", name: "男毕业生" }, { emoji: "👩‍🏫", name: "女老师" },
    { emoji: "👨‍🏫", name: "男老师" }, { emoji: "🔬", name: "显微镜" }, { emoji: "🔭", name: "望远镜" }, { emoji: "📐", name: "三角尺" },
    { emoji: "📏", name: "直尺" }, { emoji: "🧮", name: "算盘" }, { emoji: "🎓", name: "毕业帽" }, { emoji: "📋", name: "剪贴板" },
    { emoji: "📁", name: "文件夹" }, { emoji: "📂", name: "打开的文件夹" }, { emoji: "🗂️", name: "索引卡" }, { emoji: "📌", name: "图钉" },
    { emoji: "📍", name: "圆头图钉" }, { emoji: "📎", name: "回形针" }, { emoji: "✂️", name: "剪刀" }, { emoji: "🖍️", name: "蜡笔" },
    { emoji: "🖌️", name: "画笔" }, { emoji: "🎨", name: "调色板" }, { emoji: "🧪", name: "试管" }, { emoji: "🧫", name: "培养皿" }
];
addEmoji("school", school);

// ========= 14. 新增: 娱乐 & 休闲 =========
const entertainment = [
    { emoji: "🎬", name: "电影场记板" }, { emoji: "🎥", name: "摄像机" }, { emoji: "📺", name: "电视" }, { emoji: "📻", name: "收音机" },
    { emoji: "🎮", name: "游戏手柄" }, { emoji: "🕹️", name: "游戏摇杆" }, { emoji: "🎯", name: "靶心" }, { emoji: "🎪", name: "马戏团" },
    { emoji: "🎭", name: "戏剧面具" }, { emoji: "🎨", name: "艺术调色板" }, { emoji: "🎪", name: "帐篷" }, { emoji: "🎟️", name: "入场券" },
    { emoji: "🎫", name: "票" }, { emoji: "🎢", name: "过山车" }, { emoji: "🎡", name: "摩天轮" }, { emoji: "🎠", name: "旋转木马" },
    { emoji: "🏖️", name: "海滩伞" }, { emoji: "🎣", name: "钓鱼竿" }, { emoji: "🎤", name: "麦克风" }, { emoji: "🎧", name: "耳机" },
    { emoji: "🎼", name: "乐谱" }, { emoji: "🎹", name: "钢琴键盘" }, { emoji: "🥁", name: "鼓" }, { emoji: "🎷", name: "萨克斯风" },
    { emoji: "🎺", name: "小号" }, { emoji: "🎸", name: "吉他" }, { emoji: "🎻", name: "小提琴" }, { emoji: "🪕", name: "班卓琴" },
    { emoji: "🎲", name: "骰子" }, { emoji: "♟️", name: "国际象棋" }, { emoji: "🀄", name: "麻将" }, { emoji: "🎴", name: "花牌" },
    { emoji: "🃏", name: "小丑牌" }, { emoji: "🎰", name: "老虎机" }, { emoji: "🧩", name: "拼图" }, { emoji: "🪀", name: "悠悠球" },
    { emoji: "🪁", name: "风筝" }, { emoji: "🎈", name: "气球" }, { emoji: "🎉", name: "派对彩带" }, { emoji: "🎊", name: "五彩纸屑" }
];
addEmoji("entertainment", entertainment);

// 分类元数据 (显示名称和key)
const categoriesMeta = [
    { key: "all", label: "✨ 全部" },
    { key: "smileys", label: "😊 笑脸 & 人物" },
    { key: "peopleRoles", label: "👮 人物角色" },
    { key: "animals", label: "🐾 动物 & 自然" },
    { key: "food", label: "🍕 食物 & 饮料" },
    { key: "travel", label: "✈️ 旅行 & 地点" },
    { key: "activities", label: "⚽ 活动" },
    { key: "objects", label: "📦 物体" },
    { key: "officeSupplies", label: "📄 办公用品" },
    { key: "symbols", label: "💟 符号" },
    { key: "flags", label: "🏳️ 旗帜" },
    { key: "clothing", label: "👗 服饰 & 配饰" },
    { key: "weather", label: "🌦️ 天气 & 时间" },
    { key: "music", label: "🎵 乐器 & 音乐" },
    { key: "money", label: "💰 金钱 & 金融" },
    { key: "school", label: "🏫 学校 & 教育" },
    { key: "entertainment", label: "🎬 娱乐 & 休闲" }
];

// DOM 元素
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearchBtn');
const categoriesContainer = document.getElementById('categoriesContainer');
const emojiGrid = document.getElementById('emojiGrid');
const resultCountSpan = document.getElementById('resultCount');
const toastMsg = document.getElementById('toastMsg');

// 当前状态
let currentCategory = "all";
let searchKeyword = "";

// 渲染分类按钮
function renderCategories() {
    categoriesContainer.innerHTML = '';
    categoriesMeta.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `cat-btn ${currentCategory === cat.key ? 'active' : ''}`;
        btn.setAttribute('data-cat', cat.key);
        btn.innerHTML = cat.label;
        btn.addEventListener('click', () => {
            currentCategory = cat.key;
            renderCategories();
            renderEmojiGrid();
        });
        categoriesContainer.appendChild(btn);
    });
}

// 过滤表情
function getFilteredEmojis() {
    let filtered = [...EMOJIS_DATA];
    // 分类筛选
    if (currentCategory !== "all") {
        filtered = filtered.filter(emo => emo.category === currentCategory);
    }
    // 搜索筛选 (匹配名称或者emoji自身)
    if (searchKeyword.trim() !== "") {
        const kw = searchKeyword.trim().toLowerCase();
        filtered = filtered.filter(emo =>
            emo.name.toLowerCase().includes(kw) ||
            emo.emoji === kw ||
            emo.emoji.toLowerCase().includes(kw)  // 部分表情符号匹配
        );
    }
    return filtered;
}

// 渲染表情网格
function renderEmojiGrid() {
    const filtered = getFilteredEmojis();
    resultCountSpan.innerHTML = `📋 共 ${filtered.length} 个表情符号`;
    if (filtered.length === 0) {
        emojiGrid.innerHTML = `<div class="empty-state">😢 没有找到相关表情，试试其他关键词~</div>`;
        return;
    }
    // 生成卡片
    const fragment = document.createDocumentFragment();
    filtered.forEach(emo => {
        const card = document.createElement('div');
        card.className = 'emoji-card';
        card.setAttribute('data-emoji', emo.emoji);
        card.setAttribute('data-name', emo.name);
        card.innerHTML = `
            <div class="emoji-display">${emo.emoji}</div>
            <div class="emoji-name">${escapeHtml(emo.name)}</div>
        `;
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            copyToClipboard(emo.emoji, emo.name);
        });
        fragment.appendChild(card);
    });
    emojiGrid.innerHTML = '';
    emojiGrid.appendChild(fragment);
}

// 简单防XSS
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// 复制功能
function copyToClipboard(emojiChar, name) {
    if (!emojiChar) return;
    navigator.clipboard.writeText(emojiChar).then(() => {
        showToast(`✅ 已复制 ${emojiChar}  (${name})`);
    }).catch(() => {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = emojiChar;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`📋 已复制 ${emojiChar}  (${name})`);
    });
}

let toastTimer = null;
function showToast(msg) {
    toastMsg.textContent = msg.length > 40 ? msg.slice(0, 38) + '..' : msg;
    toastMsg.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastMsg.classList.remove('show');
    }, 1800);
}

// 搜索联动
function handleSearch() {
    searchKeyword = searchInput.value;
    renderEmojiGrid();
}

function clearSearch() {
    searchInput.value = '';
    searchKeyword = '';
    renderEmojiGrid();
    searchInput.focus();
}

// 初始化事件监听
function initEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    clearBtn.addEventListener('click', clearSearch);
}

// 初始加载
function init() {
    renderCategories();
    renderEmojiGrid();
    initEventListeners();
}

init();
