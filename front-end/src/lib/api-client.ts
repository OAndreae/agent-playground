import { ErrorResponseSchema } from './api-types';
import type { ResearchRequest } from './api-types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002';

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

export async function startResearch(request: ResearchRequest): Promise<Response> {
  try {
    const response = await fetch(`${API_BASE_URL}/research`, {
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
        'Failed to start research',
        response.status,
        parsed.success ? parsed.data.detail : 'Unknown error',
      );
    }

    return response;
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

export { ApiError };
