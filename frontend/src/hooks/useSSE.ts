import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';

export function useSSE<T>(url: string, pollUrl?: string, pollInterval: number = 3000) {
    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'polling'>('connecting');
    const pollTimerRef = useRef<any>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

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
        // Ensure url starts with a slash
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;

        // Full URL for EventSource
        const fullUrl = `${apiBase}${cleanUrl}`;

        const eventSource = new EventSource(fullUrl);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
            setStatus('open');
            stopPolling();
        };

        eventSource.onerror = (err) => {
            console.error('SSE Error:', err);
            eventSource.close();
            setStatus('closed');

            if (pollUrl) {
                startPolling();
            } else {
                // Wait and retry
                setTimeout(connect, 5000);
            }
        };

        eventSource.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);
                setData(parsed);
            } catch (err) {
                console.error('SSE parse error:', err);
            }
        };

        return eventSource;
    }, [url, pollUrl, startPolling, stopPolling]);

    useEffect(() => {
        const es = connect();
        return () => {
            es.close();
            stopPolling();
        };
    }, [connect, stopPolling]);

    return { data, status };
}
