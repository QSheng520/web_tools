// 自动更新年份
document.getElementById('year').textContent = new Date().getFullYear();

// 历史记录管理
const HISTORY_KEY = 'tool_history';
const MAX_HISTORY = 12; // 最多保存12条历史记录

// 获取历史记录
function getHistory() {
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (e) {
        console.error('读取历史记录失败:', e);
        return [];
    }
}

// 保存历史记录
function saveHistory(history) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('保存历史记录失败:', e);
    }
}

// 添加工具到历史记录
function addToHistory(toolName, toolUrl, toolIcon) {
    let history = getHistory();
    
    // 移除已存在的相同工具
    history = history.filter(item => item.url !== toolUrl);
    
    // 添加到开头
    history.unshift({
        name: toolName,
        url: toolUrl,
        icon: toolIcon,
        timestamp: Date.now()
    });
    
    // 限制数量
    if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
    }
    
    saveHistory(history);
    renderHistory();
}

// 渲染历史记录
function renderHistory() {
    const historyMain = document.getElementById('historyMain');
    const historyGrid = document.getElementById('historyGrid');
    const history = getHistory();

    if (history.length === 0) {
        historyMain.style.display = 'none';
        return;
    }

    historyMain.style.display = 'block';
    historyGrid.innerHTML = history.map((item, index) => {
        const timeAgo = formatTimeAgo(item.timestamp);
        return `
            <a href="${item.url}" class="history-item" data-url="${item.url}">
                <span class="history-icon">${item.icon}</span>
                <div class="history-info">
                    <div class="history-name">${item.name}</div>
                    <div class="history-time">${timeAgo}</div>
                </div>
                <button class="remove-history" onclick="removeHistoryItem(event, ${index})" title="移除">×</button>
            </a>
        `;
    }).join('');
}

// 格式化时间显示
function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    
    if (diff < minute) {
        return '刚刚';
    } else if (diff < hour) {
        return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
        return Math.floor(diff / hour) + '小时前';
    } else {
        return Math.floor(diff / day) + '天前';
    }
}

// 移除单个历史记录
function removeHistoryItem(event, index) {
    event.preventDefault();
    event.stopPropagation();
    
    let history = getHistory();
    history.splice(index, 1);
    saveHistory(history);
    renderHistory();
}

// 清空所有历史记录
function clearHistory() {
    if (confirm('确定要清空所有历史记录吗？')) {
        localStorage.removeItem(HISTORY_KEY);
        renderHistory();
    }
}

// 为所有工具卡片添加点击事件
document.addEventListener('DOMContentLoaded', function() {
    // 渲染历史记录
    renderHistory();

    // 为所有工具链接添加点击监听
    const toolLinks = document.querySelectorAll('.tools-grid a[href]:not([href="#"]):not([href^="javascript"])');
    toolLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const icon = this.querySelector('.tool-icon');
            const name = this.querySelector('.tool-name');
            
            if (icon && name) {
                addToHistory(
                    name.textContent.trim(),
                    this.href,
                    icon.textContent.trim()
                );
            }
        });
    });

    // 搜索功能
    const searchInput = document.getElementById('toolSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const toolCards = document.querySelectorAll('.tools-grid .tool-card');
            const categorySections = document.querySelectorAll('.category-section');

            toolCards.forEach(card => {
                const toolName = card.querySelector('.tool-name');
                const toolDesc = card.querySelector('.tool-desc');
                const nameText = toolName ? toolName.textContent.toLowerCase() : '';
                const descText = toolDesc ? toolDesc.textContent.toLowerCase() : '';
                
                if (nameText.includes(searchTerm) || descText.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });

            // 隐藏没有可见工具的分类
            categorySections.forEach(section => {
                const visibleCards = section.querySelectorAll('.tool-card[style*="display: flex"], .tool-card:not([style*="display: none"])');
                if (visibleCards.length === 0 && searchTerm !== '') {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            });
        });
    }
});
