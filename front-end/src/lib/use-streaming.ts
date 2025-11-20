import { useEffect, useState } from 'react';
import { streamSession } from './api-client';
import { StreamEventSchema } from './api-types';
import type { StreamEvent} from './api-types';

interface UseStreamingResult {
  data: string;
  isStreaming: boolean;
  error: string | null;
  isComplete: boolean;
}

export function useStreaming(sessionId: string | null): UseStreamingResult {
  const [data, setData] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    setIsStreaming(true);
    setError(null);
    setData('');
    setIsComplete(false);

    const eventSource = streamSession(sessionId);

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const validated = StreamEventSchema.safeParse(parsed);

        if (!validated.success) {
          console.error('Invalid stream event format:', validated.error);
          return;
        }

        const streamEvent: StreamEvent = validated.data;

        if (streamEvent.error) {
          setError(streamEvent.error);
          setIsStreaming(false);
          eventSource.close();
          return;
        }

        if (streamEvent.data && streamEvent.mime_type === 'text/plain') {
          setData((prev) => prev + streamEvent.data);
        }

        if (streamEvent.turn_complete) {
          setIsStreaming(false);
          setIsComplete(true);
          eventSource.close();
        }

      } catch (err) {
        console.error('Error parsing stream event:', err);
        setError('Failed to parse stream event');
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource error:', err);
      setError('Connection error during streaming');
      setIsStreaming(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  return {
    data,
    isStreaming,
    error,
    isComplete,
  };
}
