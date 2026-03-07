import { useState, useEffect, useCallback } from 'react';

export function useWebSocket<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');

    const connect = useCallback(() => {
        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
        let wsBase = '';

        if (apiBase.startsWith('http')) {
            // Use the backend URL from env, swapping http for ws
            wsBase = apiBase.replace(/^http/, 'ws');
        } else {
            // Local fallback
            const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            wsBase = `${protocol}://${window.location.host}`;
        }

        const socket = new WebSocket(`${wsBase}${url}`);

        socket.onopen = () => setStatus('open');
        socket.onclose = () => {
            setStatus('closed');
            // Reconnect after 3 seconds
            setTimeout(connect, 3000);
        };
        socket.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);
                setData(parsed);
            } catch (err) {
                console.error('WS parse error:', err);
            }
        };

        return socket;
    }, [url]);

    useEffect(() => {
        const socket = connect();
        return () => socket.close();
    }, [connect]);

    return { data, status };
}
