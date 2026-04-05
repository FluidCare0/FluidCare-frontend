import { useEffect, useRef } from 'react';

import { isTokenExpiringSoon, refreshAccessToken } from '../utils/token';

export const useTokenMonitor = () => {
    const intervalRef = useRef(null);

    useEffect(() => {
        const checkAndRefreshToken = async () => {
            const token = localStorage.getItem('access');

            if (token && isTokenExpiringSoon(token)) {
                console.log('Token expiring soon, refreshing...');
                await refreshAccessToken();
            }
        };

        intervalRef.current = setInterval(checkAndRefreshToken, 30000);
        checkAndRefreshToken();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);
};
