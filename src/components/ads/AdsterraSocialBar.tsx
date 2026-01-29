import { useEffect } from 'react';

const AdsterraSocialBar = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://pl28595306.effectivegatecpm.com/b7/8d/c9/b78dc99543d07bbff0fd463fd45c9f84.js';
        script.async = true;
        document.head.appendChild(script);

        return () => {
            // Limpieza al desmontar el componente (cuando el usuario se vuelve Pro o cambia de página)
            document.head.removeChild(script);
        };
    }, []);

    return null; // Este componente no renderiza nada visual, solo gestiona el script
};

export default AdsterraSocialBar;
