export const API_URL = "http://localhost:3000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const apiRequest = async (
  method: HttpMethod,
  url: string,
  data?: any,
  token?: string | null
) => {
  const headers: Record<string, string> = {
    Authorization: token ? `Bearer ${token}` : "",
  };

  const options: RequestInit = { method, headers };

  if (data !== undefined && method !== "GET") {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(data);
  }

  const res = await fetch(API_URL + url, options);
  const responseData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (responseData as any)?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return responseData;
};

export const apiGet = async (url: string, token: string | null) => {
  return apiRequest("GET", url, undefined, token);
};

export const apiPost = async (url: string, data: any, token?: string | null) => {
  return apiRequest("POST", url, data, token);
};

export const apiPut = async (url: string, data: any, token?: string | null) => {
  return apiRequest("PUT", url, data, token);
};

export const apiDelete = async (url: string, token?: string | null) => {
  return apiRequest("DELETE", url, undefined, token);
};
