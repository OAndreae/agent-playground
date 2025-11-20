import {
  CreateSessionResponseSchema,
  ErrorResponseSchema,
} from './api-types';
import type {
  CreateSessionRequest,
  CreateSessionResponse
} from './api-types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function createSession(
  request: CreateSessionRequest,
): Promise<CreateSessionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const parsed = ErrorResponseSchema.safeParse(errorData);

      throw new ApiError(
        'Failed to create session',
        response.status,
        parsed.success ? parsed.data.detail : 'Unknown error',
      );
    }

    const data = await response.json();
    const parsed = CreateSessionResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new ApiError(
        'Invalid response format from server',
        500,
        parsed.error.message,
      );
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      'Network error',
      0,
      error instanceof Error ? error.message : 'Unknown network error',
    );
  }
}

export function streamSession(sessionId: string): EventSource {
  const url = `${API_BASE_URL}/sessions/${sessionId}/stream`;
  return new EventSource(url);
}

export { ApiError };
