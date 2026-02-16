/**
 * API Client for frontend to use with NestJS backend
 *
 * This client provides type-safe access to payroll and intents endpoints.
 * Import types from @/types/database.types for full type safety.
 */

type RequestOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, userId?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    if (userId) {
      this.defaultHeaders['x-privy-user-id'] = userId;
    }
  }

  setUserId(userId: string): void {
    this.defaultHeaders['x-privy-user-id'] = userId;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = { ...this.defaultHeaders, ...options?.headers };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new ApiError(response.status, error.message || 'Request failed', error.code);
    }

    return response.json();
  }

  // Health
  async health() {
    return this.request<{
      status: string;
      timestamp: string;
      version: string;
      services: { database: string; redis: string };
    }>('GET', '/health');
  }

  // Intents (used by payroll for NEAR intents)
  intents = {
    quote: (data: {
      fromTokenId: string;
      fromChain: string;
      fromDecimals: number;
      toTokenId: string;
      toChain: string;
      toDecimals: number;
      amount: string;
      slippageBps?: number;
    }) =>
      this.request<{
        amountOut?: string;
        error?: { type: string; message?: string };
      }>('POST', '/intents/quote', data),

    status: (params: {
      depositAddress?: string;
      rhinestoneId?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params.depositAddress) searchParams.set('depositAddress', params.depositAddress);
      if (params.rhinestoneId) searchParams.set('rhinestoneId', params.rhinestoneId);
      return this.request<{
        provider: string;
        status: string;
        normalizedStatus: string;
        txHash?: string;
      }>('GET', `/intents/status?${searchParams.toString()}`);
    },

    rhinestone: {
      eligibility: (fromChain: string, toChain: string, fromSymbol?: string, toSymbol?: string) => {
        const params = new URLSearchParams({ fromChain, toChain });
        if (fromSymbol) params.set('fromSymbol', fromSymbol);
        if (toSymbol) params.set('toSymbol', toSymbol);
        return this.request<{ eligible: boolean; reason?: string }>(
          'GET',
          `/intents/rhinestone/eligibility?${params.toString()}`,
        );
      },
      chains: () =>
        this.request<{ chainIds: number[] }>('GET', '/intents/rhinestone/chains'),
    },
  };

  // Cron (admin only)
  cron = {
    status: () =>
      this.request<{ status: string }>('GET', '/cron/status'),
  };
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Factory function
export function createApiClient(baseUrl: string, userId?: string): ApiClient {
  return new ApiClient(baseUrl, userId);
}

export { ApiClient, ApiError };
