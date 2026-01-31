import { useEffect } from 'react';

const AdsterraPopUnder = () => {
    useEffect(() => {
        // @ts-ignore
        if (window.popunder_executed) return;
        // @ts-ignore
        window.popunder_executed = true;

        (function () {
            var k: any = window,
                s = "b8145a5ab672d2c4cf0a03970f8aa516",
                a = [["siteId", 940 - 468 - 531 + 988 + 26 + 5271691], ["minBid", 0], ["popundersPerIP", "0"], ["delayBetween", 0], ["default", false], ["defaultPerDay", 0], ["topmostLayer", "auto"]],
                d = ["d3d3LmRpc3BsYXl2ZXJ0aXNpbmcuY29tL1RlWS9nc2lnbWEubWluLmpz", "ZDNtem9rdHk5NTFjNXcuY2xvdWRmcm9udC5uZXQvWEh0RS9hcUtOL3dmcmVlbGFuY2VyLm1pbi5jc3M="],
                j = -1,
                y: any,
                w: any,
                h = function () {
                    clearTimeout(w);
                    j++;
                    if (d[j] && !(1795798548000 < (new Date).getTime() && 1 < j)) {
                        y = k.document.createElement("script");
                        y.type = "text/javascript";
                        y.async = !0;
                        var f = k.document.getElementsByTagName("script")[0];
                        y.src = "https://" + atob(d[j]);
                        y.crossOrigin = "anonymous";
                        y.onerror = h;
                        y.onload = function () {
                            clearTimeout(w);
                            k[s.slice(0, 16) + s.slice(0, 16)] || h()
                        };
                        w = setTimeout(h, 5E3);
                        f.parentNode.insertBefore(y, f)
                    }
                };
            if (!k[s]) {
                try {
                    Object.freeze(k[s] = a)
                } catch (e) { }
                h()
            }
        })();
    }, []);

    return null;
};

export default AdsterraPopUnder;
