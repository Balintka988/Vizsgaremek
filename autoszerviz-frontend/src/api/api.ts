export const API_URL = "http://localhost:3000/api";
 
export const apiGet = async (url: string, token: string | null) => {
  const res = await fetch(API_URL + url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
 
  const responseData = await res.json().catch(() => ({}));
 
  if (!res.ok) {
    const msg = (responseData as any)?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
 
  return responseData;
};
 
export const apiPost = async (
  url: string,
  data: any,
  token?: string | null
) => {
  const res = await fetch(API_URL + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });
 
  const responseData = await res.json().catch(() => ({}));
 
  if (!res.ok) {
    const msg = (responseData as any)?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
 
  return responseData;
};
 
export const apiPut = async (url: string, data: any, token?: string | null) => {
  const res = await fetch(API_URL + url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });
 
  const responseData = await res.json().catch(() => ({}));
 
  if (!res.ok) {
    const msg = (responseData as any)?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
 
  return responseData;
};
 
export const apiDelete = async (url: string, token?: string | null) => {
  const res = await fetch(API_URL + url, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
 
  const responseData = await res.json().catch(() => ({}));
 
  if (!res.ok) {
    const msg = (responseData as any)?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
 
  return responseData;
};