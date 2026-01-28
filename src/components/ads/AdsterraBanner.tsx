import { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
    id: string;
    height: number;
    width: number;
}

const AdsterraBanner = ({ id, height, width }: AdsterraBannerProps) => {
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (adRef.current && !adRef.current.firstChild) {
            const atOptions = {
                key: id,
                format: 'iframe',
                height: height,
                width: width,
                params: {}
            };

            const scriptConfig = document.createElement('script');
            scriptConfig.type = 'text/javascript';
            scriptConfig.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`;

            const scriptInvoke = document.createElement('script');
            scriptInvoke.type = 'text/javascript';
            scriptInvoke.src = `https://www.highperformanceformat.com/${id}/invoke.js`;

            adRef.current.appendChild(scriptConfig);
            adRef.current.appendChild(scriptInvoke);
        }
    }, [id, height, width]);

    return (
        <div
            className="flex justify-center items-center w-full overflow-hidden my-4"
            ref={adRef}
            style={{ minHeight: height, minWidth: width }}
        >
            {/* El anuncio se inyectará aquí */}
        </div>
    );
};

export default AdsterraBanner;
