(function(){
    "use strict";

    // ---------- 全局配置 ----------
    const CACHE_PREFIX = 'hist_cache_';
    const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7天
    const API_BASE = 'https://api.wikimedia.org/feed/v1/wikipedia/zh/onthisday/selected';
    
    // ---------- 内置本地回退数据 (精简但覆盖典型日期) ----------
    const FALLBACK_EVENTS = {
        '04-12': [
            { year: 1961, text: '苏联宇航员尤里·加加林乘坐"东方一号"飞船进入太空，成为人类历史上第一位进入太空的人。', pages: [{ content_urls: { desktop: { page: 'https://zh.wikipedia.org/wiki/%E5%B0%A4%E9%87%8C%C2%B7%E5%8A%A0%E5%8A%A0%E6%9E%97' } } }] },
            { year: 1981, text: '美国第一架航天飞机"哥伦比亚号"在佛罗里达州肯尼迪航天中心首次发射升空。', pages: [{ content_urls: { desktop: { page: 'https://zh.wikipedia.org/wiki/%E5%93%A5%E4%BC%A6%E6%AF%94%E4%BA%9A%E5%8F%B7%E8%88%AA%E5%A4%A9%E9%A3%9E%E6%9C%BA' } } }] },
            { year: 1945, text: '美国总统富兰克林·罗斯福逝世，副总统哈里·杜鲁门继任。', pages: [{ content_urls: { desktop: { page: 'https://zh.wikipedia.org/wiki/%E5%AF%8C%E5%85%B0%E5%85%8B%E6%9E%97%C2%B7%E7%BD%97%E6%96%AF%E7%A6%8F' } } }] }
        ],
        '01-01': [
            { year: 1801, text: '意大利天文学家朱塞普·皮亚齐发现第一颗小行星"谷神星"。', pages: [{ content_urls: { desktop: { page: 'https://zh.wikipedia.org/wiki/%E8%B0%B7%E7%A5%9E%E6%98%9F' } } }] },
            { year: 1959, text: '古巴革命胜利，菲德尔·卡斯特罗率领起义军进入哈瓦那。', pages: [{ content_urls: { desktop: { page: 'https://zh.wikipedia.org/wiki/%E5%8F%A4%E5%B7%B4%E9%9D%A9%E5%91%BD' } } }] }
        ],
        '10-01': [
            { year: 1949, text: '中华人民共和国开国大典在北京天安门广场举行，毛泽东主席宣告中华人民共和国成立。', pages: [{ content_urls: { desktop: { page: 'https://zh.wikipedia.org/wiki/%E4%B8%AD%E5%8D%8E%E4%BA%BA%E6%B0%91%E5%85%B1%E5%92%8C%E5%9B%BD' } } }] }
        ]
    };

    // 通用回退：当日期没有预置时，返回一条友好提示
    const GENERIC_FALLBACK = [{ year: '未知', text: '今日暂无本地事件数据，请联网获取维基百科历史。', pages: [] }];

    // ---------- DOM 元素 ----------
    const dateLabel = document.getElementById('currentDateLabel');
    const cacheLabelSpan = document.getElementById('cacheLabel');
    const cacheStatusDiv = document.getElementById('cacheStatus');
    const skeletonLoader = document.getElementById('skeletonLoader');
    const eventContent = document.getElementById('eventContent');
    const messageArea = document.getElementById('messageArea');
    const allEventsPanel = document.getElementById('allEventsPanel');
    const allEventsList = document.getElementById('allEventsList');
    const eventCountSpan = document.getElementById('eventCount');
    
    const prevBtn = document.getElementById('prevDayBtn');
    const nextBtn = document.getElementById('nextDayBtn');
    const todayBtn = document.getElementById('todayBtn');
    const refreshOneBtn = document.getElementById('refreshOneBtn');
    const toggleAllBtn = document.getElementById('toggleAllBtn');
    const forceRefreshBtn = document.getElementById('forceRefreshBtn');

    // ---------- 应用状态 ----------
    let currentMonth = 4;       // 默认4月
    let currentDay = 12;        // 默认12日
    let currentEvents = [];     // 当前日期的事件数组
    let currentEventIndex = -1; // 当前展示的事件索引（用于避免重复）
    let isCacheHit = false;     // 标记是否来自缓存
    let isLoading = false;
    let allPanelVisible = false;

    // ---------- 辅助函数 ----------
    function formatMonthDay(month, day) {
        return `${month}月${day}日`;
    }

    function getCacheKey(month, day) {
        const mm = month.toString().padStart(2, '0');
        const dd = day.toString().padStart(2, '0');
        return `${CACHE_PREFIX}${mm}_${dd}`;
    }

    // 从localStorage读取缓存
    function getCachedEvents(month, day) {
        const key = getCacheKey(month, day);
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.data && parsed.timestamp) {
                const now = Date.now();
                if (now - parsed.timestamp < CACHE_TTL_MS) {
                    return parsed.data;
                }
            }
        } catch (e) {
            console.warn('缓存解析失败', e);
        }
        return null;
    }

    // 写入缓存
    function setCachedEvents(month, day, events) {
        const key = getCacheKey(month, day);
        const cacheObj = {
            data: events,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cacheObj));
    }

    // 从API获取数据 (返回格式化后的事件数组)
    async function fetchFromAPI(month, day) {
        const mm = month.toString().padStart(2, '0');
        const dd = day.toString().padStart(2, '0');
        const url = `${API_BASE}/${mm}/${dd}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'HistoryTodayApp/1.0 (https://example.com; contact@example.org)'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API响应错误: ${response.status}`);
        }
        const data = await response.json();
        
        // 解析 selected 数组
        if (data.selected && Array.isArray(data.selected)) {
            return data.selected.map(item => ({
                year: item.year,
                text: item.text || '',
                pages: item.pages || []
            }));
        }
        return [];
    }

    // 获取回退数据 (优先日期匹配，否则通用)
    function getFallbackEvents(month, day) {
        const key = `${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
        if (FALLBACK_EVENTS[key]) {
            return FALLBACK_EVENTS[key];
        }
        return GENERIC_FALLBACK;
    }

    // 核心：加载事件 (缓存优先 -> API -> 回退)
    async function loadEventsForDate(month, day, ignoreCache = false) {
        if (isLoading) return;
        isLoading = true;
        
        // UI: 显示加载状态
        showLoading(true);
        hideMessage();
        eventContent.classList.add('hidden');
        
        const cacheKey = getCacheKey(month, day);
        let events = null;
        let usedCache = false;
        let error = null;

        try {
            // 1. 读缓存 (若不忽略)
            if (!ignoreCache) {
                const cached = getCachedEvents(month, day);
                if (cached) {
                    events = cached;
                    usedCache = true;
                    console.log(`[缓存命中] ${month}-${day}`);
                }
            }

            // 2. 无有效缓存或强制刷新 → 请求API
            if (!events) {
                try {
                    events = await fetchFromAPI(month, day);
                    usedCache = false;
                    // 存入缓存
                    if (events && events.length > 0) {
                        setCachedEvents(month, day, events);
                    }
                } catch (apiErr) {
                    console.warn('API请求失败，使用回退数据', apiErr);
                    error = apiErr;
                    // 回退逻辑
                    events = getFallbackEvents(month, day);
                    usedCache = false; // 回退不算缓存
                }
            }

            // 如果events仍为空或无效，最后保底
            if (!events || events.length === 0) {
                events = getFallbackEvents(month, day);
            }

        } catch (e) {
            error = e;
            events = getFallbackEvents(month, day);
            usedCache = false;
        } finally {
            isLoading = false;
        }

        // 更新状态
        currentEvents = events;
        isCacheHit = usedCache;
        
        // 更新缓存标识
        updateCacheBadge(usedCache);
        
        // 渲染
        if (currentEvents.length === 0) {
            showMessage('📭 这一天暂无历史事件记载', false);
            eventContent.classList.add('hidden');
            currentEventIndex = -1;
        } else {
            hideMessage();
            // 随机选取一条展示 (避免与上次相同，若可能)
            pickRandomEvent(true);
        }
        
        // 如果全部面板处于展开状态，刷新列表
        if (allPanelVisible) {
            renderAllEventsList();
        }
        showLoading(false);
        
        // 更新计数
        eventCountSpan.textContent = currentEvents.length;
    }

    // 随机选取事件 (forceDifferent: 尽量不同)
    function pickRandomEvent(forceDifferent = true) {
        if (!currentEvents.length) return;
        
        let newIndex;
        if (currentEvents.length === 1) {
            newIndex = 0;
        } else {
            do {
                newIndex = Math.floor(Math.random() * currentEvents.length);
            } while (forceDifferent && newIndex === currentEventIndex && currentEvents.length > 1);
        }
        currentEventIndex = newIndex;
        renderEventCard(currentEvents[currentEventIndex]);
    }

    // 渲染单条事件卡片
    function renderEventCard(event) {
        if (!event) return;
        eventContent.classList.remove('hidden');
        messageArea.classList.add('hidden');
        
        const year = event.year || '?';
        // 提取纯文本描述 (保留换行感，去除html标签)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = event.text || '';
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        
        // 获取来源链接
        let linkUrl = '#';
        if (event.pages && event.pages.length > 0 && event.pages[0].content_urls?.desktop?.page) {
            linkUrl = event.pages[0].content_urls.desktop.page;
        }
        
        // 标题：截取前段作为标题感 (可使用纯文本前30字符)
        const titleText = plainText.length > 50 ? plainText.substring(0, 50) + '…' : plainText;
        
        eventContent.innerHTML = `
            <div class="event-year">${year}</div>
            <div class="event-title">${escapeHtml(titleText) || '历史事件'}</div>
            <div class="event-description">${escapeHtml(plainText)}</div>
            ${linkUrl !== '#' ? 
                `<a href="${escapeHtml(linkUrl)}" target="_blank" rel="noopener noreferrer" class="event-link">📖 在维基百科阅读 <span class="link-icon">→</span></a>` : 
                `<span class="event-link" style="opacity:0.6;">暂无来源链接</span>`}
        `;
    }

    // 简单转义
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 渲染全部事件列表
    function renderAllEventsList() {
        if (!currentEvents.length) {
            allEventsList.innerHTML = '<div class="msg-placeholder">没有事件可显示</div>';
            return;
        }
        let html = '';
        currentEvents.forEach((ev, idx) => {
            const year = ev.year || '?';
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = ev.text || '';
            const plain = tempDiv.textContent || '';
            let link = '#';
            if (ev.pages?.[0]?.content_urls?.desktop?.page) {
                link = ev.pages[0].content_urls.desktop.page;
            }
            html += `<div class="event-list-item">
                <span class="event-list-year">${escapeHtml(String(year))}</span>
                <span class="event-list-text">${escapeHtml(plain)}</span>
                ${link !== '#' ? `<a href="${escapeHtml(link)}" target="_blank" class="event-list-link">[详情]</a>` : ''}
            </div>`;
        });
        allEventsList.innerHTML = html;
        eventCountSpan.textContent = currentEvents.length;
    }

    // UI状态控制
    function showLoading(show) {
        if (show) {
            skeletonLoader.classList.remove('hidden');
            eventContent.classList.add('hidden');
            messageArea.classList.add('hidden');
        } else {
            skeletonLoader.classList.add('hidden');
        }
    }

    function showMessage(msg, isError = false) {
        messageArea.classList.remove('hidden');
        messageArea.innerHTML = isError ? `<span class="error-text">⚠️ ${msg}</span>` : msg;
        eventContent.classList.add('hidden');
    }

    function hideMessage() {
        messageArea.classList.add('hidden');
    }

    function updateCacheBadge(isCached) {
        if (isCached) {
            cacheLabelSpan.textContent = '已缓存';
            cacheStatusDiv.style.background = '#e2d9cf';
        } else {
            cacheLabelSpan.textContent = '实时';
            cacheStatusDiv.style.background = '#eae3db';
        }
    }

    // 更新日期显示并触发加载
    function setDate(month, day) {
        currentMonth = month;
        currentDay = day;
        dateLabel.textContent = formatMonthDay(month, day);
        
        // 重置索引，避免跨日期混淆
        currentEventIndex = -1;
        // 关闭全部面板 (可选)
        if (allPanelVisible) {
            toggleAllPanel(false);
        }
        loadEventsForDate(month, day, false);
    }

    // 切换全部面板
    function toggleAllPanel(show) {
        if (show === undefined) show = !allPanelVisible;
        allPanelVisible = show;
        if (show) {
            allEventsPanel.classList.remove('hidden');
            toggleAllBtn.innerHTML = '📕 收起全部';
            renderAllEventsList();
        } else {
            allEventsPanel.classList.add('hidden');
            toggleAllBtn.innerHTML = '📋 展开今日全部';
        }
    }

    // 日期计算 (+-1天)
    function changeDay(delta) {
        const date = new Date(2024, currentMonth - 1, currentDay); // 年份不影响月日
        date.setDate(date.getDate() + delta);
        const newMonth = date.getMonth() + 1;
        const newDay = date.getDate();
        setDate(newMonth, newDay);
    }

    // 回到今天
    function goToToday() {
        const today = new Date();
        setDate(today.getMonth() + 1, today.getDate());
    }

    // ---------- 初始化 & 事件绑定 ----------
    function init() {
        // 设置今天日期
        const today = new Date();
        currentMonth = today.getMonth() + 1;
        currentDay = today.getDate();
        dateLabel.textContent = formatMonthDay(currentMonth, currentDay);
        
        // 加载初始数据
        loadEventsForDate(currentMonth, currentDay, false);
        
        // 监听按钮
        prevBtn.addEventListener('click', () => changeDay(-1));
        nextBtn.addEventListener('click', () => changeDay(1));
        todayBtn.addEventListener('click', goToToday);
        
        refreshOneBtn.addEventListener('click', () => {
            if (currentEvents.length > 0) {
                pickRandomEvent(true);
            } else {
                showMessage('没有事件可切换', false);
            }
        });
        
        toggleAllBtn.addEventListener('click', () => toggleAllPanel());
        
        forceRefreshBtn.addEventListener('click', () => {
            if (isLoading) return;
            loadEventsForDate(currentMonth, currentDay, true); // 忽略缓存
        });
    }

    // 启动
    init();
})();
