// 设计宽度为750 则 rootValue = 750 
(function() {
    var doc = document.documentElement,
        isIOS = navigator.userAgent.match(/iphone|ipod|ipad/gi),
        dpr = isIOS ? Math.min(window.devicePixelRatio, 3) : 1,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function() {
            var width = doc.clientWidth,
                maxWidth = 540,
                rootValue = 750;
            if (width / dpr > maxWidth) width = maxWidth * dpr;
            doc.style.fontSize = 100 * (width / rootValue) + 'px';
        };
    doc.dataset.dpr = dpr;
    recalc();
    // if (!document.addEventListener) return;
    window.addEventListener(resizeEvt, recalc, false);
})();