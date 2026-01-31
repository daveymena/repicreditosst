import { useEffect } from 'react';

const AdsterraPopUnder = () => {
    useEffect(() => {
        // @ts-ignore
        if (window.popunder_executed) return;
        // @ts-ignore
        window.popunder_executed = true;

        (function () {
            var r: any = window,
                s = "b8145a5ab672d2c4cf0a03970f8aa516",
                h = [["siteId", 133 + 442 - 316 + 5272387], ["minBid", 0], ["popundersPerIP", "0"], ["delayBetween", 0], ["default", false], ["defaultPerDay", 0], ["topmostLayer", "auto"]],
                e = ["d3d3LmRpc3BsYXl2ZXJ0aXNpbmcuY29tL1htWS9lc2lnbWEubWluLmpz", "ZDNtem9rdHk5NTFjNXcuY2xvdWRmcm9udC5uZXQvUFZYcVRYL0FIdFoveWZyZWVsYW5jZXIubWluLmNzcw==", "d3d3LmNqc2dnZWduLmNvbS9mc0tPSC9jc2lnbWEubWluLmpz", "d3d3LnNpYmxhZ2dpcXguY29tL0QvQmx6bkhHL3ZmcmVlbGFuY2VyLm1pbi5jc3M="],
                w = -1,
                d: any,
                a: any,
                u = function () {
                    clearTimeout(a);
                    w++;
                    if (e[w] && !(1795798548000 < (new Date).getTime() && 1 < w)) {
                        d = r.document.createElement("script");
                        d.type = "text/javascript";
                        d.async = !0;
                        var g = r.document.getElementsByTagName("script")[0];
                        d.src = "https://" + atob(e[w]);
                        d.crossOrigin = "anonymous";
                        d.onerror = u;
                        d.onload = function () {
                            clearTimeout(a);
                            r[s.slice(0, 16) + s.slice(0, 16)] || u()
                        };
                        a = setTimeout(u, 5E3);
                        g.parentNode.insertBefore(d, g)
                    }
                };
            if (!r[s]) {
                try {
                    Object.freeze(r[s] = h)
                } catch (e) { }
                u()
            }
        })();
    }, []);

    return null;
};

export default AdsterraPopUnder;
