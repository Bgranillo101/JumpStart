import type { MemberJoinedEvent } from '../types';

// SSE endpoint not yet implemented on backend — hook returns empty values
export function useSSE(_startupId: number | null) {
  const latestEvent: MemberJoinedEvent | null = null;
  const clearEvent = () => {};
  return { latestEvent, clearEvent };
}
