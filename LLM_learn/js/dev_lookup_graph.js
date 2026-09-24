/**
 * dev_lookup_graph.html · 软件开发各阶段图表速查
 *
 * 1) 顶部按阶段筛选卡片
 * 2) 点击图示例放大查看（Esc / 点击任意处关闭）
 */
(function () {
    'use strict';

    function init() {
        initFilter();
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
