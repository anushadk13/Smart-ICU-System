import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';

export function useWebSocket<T>(url: string, pollUrl?: string, pollInterval: number = 3000) {
    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'polling'>('connecting');
    const pollTimerRef = useRef<any>(null);

    const startPolling = useCallback(() => {
        if (!pollUrl) return;
        setStatus('polling');

        const fetchLatest = async () => {
            try {
                const res = await api.get(pollUrl);
                setData(res.data);
            } catch (err) {
                console.error('Polling error:', err);
            }
        };

        fetchLatest();
        pollTimerRef.current = setInterval(fetchLatest, pollInterval);
    }, [pollUrl, pollInterval]);

    const stopPolling = useCallback(() => {
        if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
        }
    }, []);

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

        // Remove trailing slash if present in wsBase
        const cleanWsBase = wsBase.endsWith('/') ? wsBase.slice(0, -1) : wsBase;
        // Ensure url starts with a slash
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;

        const socket = new WebSocket(`${cleanWsBase}${cleanUrl}`);

        socket.onopen = () => {
            setStatus('open');
            stopPolling();
        };

        socket.onerror = () => {
            socket.close();
        };

        socket.onclose = () => {
            setStatus('closed');
            if (pollUrl) {
                startPolling();
            } else {
                setTimeout(connect, 3000);
            }
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
    }, [url, pollUrl, startPolling, stopPolling]);

    useEffect(() => {
        const socket = connect();
        return () => {
            socket.close();
            stopPolling();
        };
    }, [connect, stopPolling]);

    return { data, status };
}
