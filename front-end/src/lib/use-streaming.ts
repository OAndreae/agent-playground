import { useEffect, useState } from 'react';

interface UseStreamingResult {
  data: string;
  isStreaming: boolean;
  error: string | null;
  isComplete: boolean;
}

export function useStreaming(response: Response | null): UseStreamingResult {
  const [data, setData] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    if (!response) {
      return;
    }

    setIsStreaming(true);
    setError(null);
    setData('');
    setIsComplete(false);

    const processStream = async () => {
      try {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setIsStreaming(false);
            setIsComplete(true);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          setData((prev) => prev + chunk);
        }
      } catch (err) {
        console.error('Error reading stream:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to read stream',
        );
        setIsStreaming(false);
      }
    };

    processStream();

    return () => {
      // Cancel the stream if the component unmounts
      response.body?.cancel();
    };
  }, [response]);

  return {
    data,
    isStreaming,
    error,
    isComplete,
  };
}
