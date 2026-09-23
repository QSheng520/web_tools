/**
 * LangGraph 内部组件一眼看懂 —— 页面脚本
 *
 * 说明：原 langGraph.html 中没有任何内联 JS，此文件为拆分时新增的
 * 渐进增强逻辑（滚动淡入），删掉它或去掉 index 里的 <script> 不影响内容。
 */
(function () {
    'use strict';

    function init() {
        var targets = document.querySelectorAll('section, header');
        if (!targets.length) return;

        // 浏览器不支持 IntersectionObserver 时直接跳过，内容照常显示
        if (!('IntersectionObserver' in window)) return;

        document.body.classList.add('reveal-ready');

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -80px 0px', threshold: 0.05 });

        Array.prototype.forEach.call(targets, function (el, i) {
            el.classList.add('reveal');
            // 首屏内容不延迟，后续依次错开一点点
            el.style.transitionDelay = (i === 0 ? 0 : Math.min(i, 3) * 60) + 'ms';
            observer.observe(el);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
