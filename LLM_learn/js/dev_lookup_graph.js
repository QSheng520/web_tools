/**
 * dev_lookup_graph.html · 软件开发各阶段图表速查
 *
 * 1) 顶部按阶段筛选卡片
 * 2) 每张卡片在图例间切换：简例（默认）/ 丰富示例，另有全局一键切换
 * 3) 点击图示例放大查看（Esc / 点击任意处关闭）
 */
(function () {
    'use strict';

    function init() {
        initFilter();
        initDiagramSwitch();
        initDiagramZoom();
    }

    /* 按阶段筛选卡片 */
    function initFilter() {
        var bar = document.getElementById('filterBar');
        if (!bar) return;

        var cards = document.querySelectorAll('.card');
        bar.addEventListener('click', function (e) {
            if (e.target.tagName !== 'BUTTON') return;
            bar.querySelectorAll('button').forEach(function (b) {
                b.classList.remove('active');
            });
            e.target.classList.add('active');

            var filter = e.target.dataset.filter;
            cards.forEach(function (card) {
                card.classList.toggle('hidden', filter !== 'all' && card.dataset.phase !== filter);
            });
        });
    }

    /* 简例 / 丰富示例切换：单卡片按钮 + 全局按钮 */
    function initDiagramSwitch() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.card'))
            .filter(function (card) { return card.querySelector('.diagram-rich'); });

        cards.forEach(function (card) {
            var btn = card.querySelector('.btn-rich');
            if (!btn) return;
            btn.addEventListener('click', function () {
                setCardRich(card, !card.classList.contains('rich'));
            });
        });

        var allBtn = document.getElementById('toggleAllRich');
        if (!allBtn) return;

        allBtn.addEventListener('click', function () {
            var toRich = !allBtn.classList.contains('on');
            cards.forEach(function (card) { setCardRich(card, toRich); });
            allBtn.classList.toggle('on', toRich);
            allBtn.textContent = toRich ? '全部看简例' : '全部看丰富示例';
        });
    }

    function setCardRich(card, rich) {
        card.classList.toggle('rich', rich);
        var btn = card.querySelector('.btn-rich');
        if (btn) btn.textContent = rich ? '看简例' : '看丰富示例';
    }

    /* 点击图示例放大查看 */
    function initDiagramZoom() {
        var modal = document.getElementById('diagramModal');
        var modalBody = document.getElementById('modalBody');
        if (!modal || !modalBody) return;

        // 点击弹窗内任意处关闭
        modal.addEventListener('click', function () {
            modal.classList.remove('show');
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') modal.classList.remove('show');
        });

        document.querySelectorAll('.diagram').forEach(function (d) {
            d.addEventListener('click', function () {
                modalBody.dataset.phase = d.closest('.card').dataset.phase;
                modalBody.innerHTML = d.innerHTML + '<div class="modal-cap">点击任意处关闭</div>';
                modal.classList.add('show');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
