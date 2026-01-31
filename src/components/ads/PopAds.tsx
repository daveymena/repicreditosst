import { useEffect } from 'react';

const PopAds = () => {
    useEffect(() => {
        // @ts-ignore
        if (window.popads_executed) return;
        // @ts-ignore
        window.popads_executed = true;

        // @ts-ignore
        window._pop = window._pop || [];
        // @ts-ignore
        window._pop.push(['siteId', 5272646]);
        // @ts-ignore
        window._pop.push(['minBid', 0]);
        // @ts-ignore
        window._pop.push(['popundersPerIP', 0]);
        // @ts-ignore
        window._pop.push(['delayBetween', 0]);
        // @ts-ignore
        window._pop.push(['default', false]);
        // @ts-ignore
        window._pop.push(['defaultPerDay', 0]);
        // @ts-ignore
        window._pop.push(['topmostLayer', 'auto']);

        (function () {
            var pa = document.createElement('script');
            pa.type = 'text/javascript';
            pa.async = true;
            var s = document.getElementsByTagName('script')[0];
            pa.src = '//c1.popads.net/pop.js';
            pa.onerror = function () {
                var sa = document.createElement('script');
                sa.type = 'text/javascript';
                sa.async = true;
                sa.src = '//c2.popads.net/pop.js';
                if (s && s.parentNode) {
                    s.parentNode.insertBefore(sa, s);
                }
            };
            if (s && s.parentNode) {
                s.parentNode.insertBefore(pa, s);
            }
        })();
    }, []);

    return null;
};

export default PopAds;
