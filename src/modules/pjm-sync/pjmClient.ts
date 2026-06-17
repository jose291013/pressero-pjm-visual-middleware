import { env } from "../../config/env.js";
import type {
  PjmAuthenticateResponse,
  PjmCreateJobsRequest,
  PjmCreateJobsResponse,
  PjmEngineOptionValue,
  PjmEngineOptionsResponse,
  PjmEngineRequest,
  PjmOrganizationListResponse,
  PjmOptionsAndPriceResponse,
  PjmProductEngineListResponse
} from "./pjmContracts.types.js";

const DEFAULT_TOKEN_TTL_MS = 50 * 60 * 1000;

export type PjmFetch = (
  input: string | URL,
  init?: RequestInit
) => Promise<Response>;

export type PjmClientConfig = {
  publicBaseUrl: string;
  username: string;
  password: string;
  tokenTtlMs?: number;
  fetchImpl?: PjmFetch;
};

type PjmTokenCache = {
  token: string | null;
  expiresAt: number | null;
};

export class PjmHttpError extends Error {
  readonly status: number;
  readonly url: string;
  readonly body: string;

  constructor(message: string, status: number, url: string, body: string) {
    super(message);
    this.name = "PjmHttpError";
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

export function buildPjmEngineOptionsRequest(
  engineIntegrationId: string,
  options: PjmEngineOptionValue[] = []
): PjmEngineRequest {
  return {
    Operation: "options",
    Product: engineIntegrationId,
    Options: options
  };
}

export function buildPjmOptionsAndPriceRequest(
  engineIntegrationId: string,
  options: PjmEngineOptionValue[]
): PjmEngineRequest {
  return {
    Operation: "optionsandprice",
    Product: engineIntegrationId,
    Options: options
  };
}

export function extractPjmToken(response: PjmAuthenticateResponse): string {
  const token =
    response.Token ??
    response.token ??
    response.AccessToken ??
    response.accessToken ??
    response.access_token;

  if (!token) {
    throw new Error("PJM authentication response did not include a token.");
  }

  return token;
}

export function readPjmClientConfigFromEnv(): PjmClientConfig {
  const publicBaseUrl = env.pjm.publicBaseUrl?.trim();
  const username = env.pjm.username?.trim();
  const password = env.pjm.password?.trim();

  if (!publicBaseUrl || !username || !password) {
    throw new Error(
      "Missing PJM_PUBLIC_BASE_URL, PJM_USERNAME or PJM_PASSWORD."
    );
  }

  return {
    publicBaseUrl,
    username,
    password
  };
}

export class PjmClient {
  private readonly publicBaseUrl: string;
  private readonly username: string;
  private readonly password: string;
  private readonly tokenTtlMs: number;
  private readonly fetchImpl: PjmFetch;
  private tokenCache: PjmTokenCache = {
    token: null,
    expiresAt: null
  };

  constructor(config: PjmClientConfig) {
    this.publicBaseUrl = config.publicBaseUrl.replace(/\/+$/, "");
    this.username = config.username;
    this.password = config.password;
    this.tokenTtlMs = config.tokenTtlMs ?? DEFAULT_TOKEN_TTL_MS;
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async authenticate(forceRefresh = false): Promise<string> {
    const now = Date.now();

    if (
      !forceRefresh &&
      this.tokenCache.token &&
      this.tokenCache.expiresAt &&
      this.tokenCache.expiresAt > now + 60_000
    ) {
      return this.tokenCache.token;
    }

    const response = await this.postJson<PjmAuthenticateResponse>(
      "/public/Authenticate",
      {
        UserName: this.username,
        Password: this.password
      },
      null
    );
    const token = extractPjmToken(response);

    this.tokenCache = {
      token,
      expiresAt: now + this.tokenTtlMs
    };

    return token;
  }

  async listProductEngines(): Promise<PjmProductEngineListResponse> {
    return this.postJson<PjmProductEngineListResponse>(
      "/public/productEngines/list",
      {},
      await this.authenticate()
    );
  }

  async listOrganizations(): Promise<PjmOrganizationListResponse> {
    return this.postJson<PjmOrganizationListResponse>(
      "/public/Organizations/list",
      {},
      await this.authenticate()
    );
  }

  async getEngineOptions(
    engineIntegrationId: string,
    options: PjmEngineOptionValue[] = []
  ): Promise<PjmEngineOptionsResponse> {
    return this.callEngine<PjmEngineOptionsResponse>(
      buildPjmEngineOptionsRequest(engineIntegrationId, options)
    );
  }

  async getOptionsAndPrice(
    engineIntegrationId: string,
    options: PjmEngineOptionValue[]
  ): Promise<PjmOptionsAndPriceResponse> {
    return this.callEngine<PjmOptionsAndPriceResponse>(
      buildPjmOptionsAndPriceRequest(engineIntegrationId, options)
    );
  }

  async createJobs(
    payload: PjmCreateJobsRequest
  ): Promise<PjmCreateJobsResponse> {
    return this.postJson<PjmCreateJobsResponse>(
      "/public/jobs",
      payload,
      await this.authenticate()
    );
  }

  async callEngine<TResponse>(payload: PjmEngineRequest): Promise<TResponse> {
    return this.postJson<TResponse>(
      "/public/engine",
      payload,
      await this.authenticate()
    );
  }

  clearTokenCache(): void {
    this.tokenCache = {
      token: null,
      expiresAt: null
    };
  }

  private async postJson<TResponse>(
    path: string,
    payload: unknown,
    bearerToken: string | null
  ): Promise<TResponse> {
    const url = `${this.publicBaseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (bearerToken) {
      headers.Authorization = `Bearer ${bearerToken}`;
    }

    const response = await this.fetchImpl(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    if (!response.ok) {
      throw new PjmHttpError(
        `PJM request failed with status ${response.status}.`,
        response.status,
        url,
        text
      );
    }

    if (!text.trim()) {
      return {} as TResponse;
    }

    try {
      return JSON.parse(text) as TResponse;
    } catch {
      throw new Error(`PJM response is not valid JSON for ${url}.`);
    }
  }
}

export function createPjmClientFromEnv(): PjmClient {
  return new PjmClient(readPjmClientConfigFromEnv());
}
