import { useEffect, useState, useRef } from 'react';
import { getSSEUrl } from '../api';
import type { MemberJoinedEvent } from '../types';

export function useSSE(startupId: number | null) {
  const [latestEvent, setLatestEvent] = useState<MemberJoinedEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!startupId) return;

    const url = getSSEUrl(startupId);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('member-joined', (e: MessageEvent) => {
      try {
        const data: MemberJoinedEvent = JSON.parse(e.data);
        setLatestEvent(data);
      } catch {
        // ignore malformed events
      }
    });

    es.onerror = () => {
      // Reconnect is handled automatically by EventSource
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [startupId]);

  const clearEvent = () => setLatestEvent(null);

  return { latestEvent, clearEvent };
}
