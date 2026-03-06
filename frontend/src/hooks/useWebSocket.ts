import { useState, useEffect, useCallback } from 'react';

export function useWebSocket<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');

    const connect = useCallback(() => {
        const wsUrl = `ws://${window.location.host}${url}`;
        const socket = new WebSocket(wsUrl);

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
