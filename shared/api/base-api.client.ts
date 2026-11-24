import { APIRequestContext, APIResponse, request } from '@playwright/test';
import { ENV } from '../config/env.config';

/**
 * Base API Client wrapping Playwright's APIRequestContext.
 * Simplifies REST API calls, header management, and response assertion.
 */
export class BaseApiClient {
  protected context: APIRequestContext | null = null;
  readonly baseUrl: string;

  constructor(context?: APIRequestContext, baseUrl?: string) {
    if (context) this.context = context;
    this.baseUrl = baseUrl || ENV.api.baseUrl;
  }

  async getContext(): Promise<APIRequestContext> {
    if (!this.context) {
      this.context = await request.newContext({
        baseURL: this.baseUrl,
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(ENV.api.apiKey ? { 'Authorization': `Bearer ${ENV.api.apiKey}` } : {}),
        },
      });
    }
    return this.context;
  }

  async get(endpoint: string, params?: Record<string, string | number>): Promise<APIResponse> {
    const ctx = await this.getContext();
    return ctx.get(endpoint, { params });
  }

  async post(endpoint: string, data?: unknown): Promise<APIResponse> {
    const ctx = await this.getContext();
    return ctx.post(endpoint, { data });
  }

  async put(endpoint: string, data?: unknown): Promise<APIResponse> {
    const ctx = await this.getContext();
    return ctx.put(endpoint, { data });
  }

  async patch(endpoint: string, data?: unknown): Promise<APIResponse> {
    const ctx = await this.getContext();
    return ctx.patch(endpoint, { data });
  }

  async delete(endpoint: string): Promise<APIResponse> {
    const ctx = await this.getContext();
    return ctx.delete(endpoint);
  }
}

export default BaseApiClient;
