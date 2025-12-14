export const API_URL = "http://localhost:3000/api";

export const apiGet = async (url: string, token: string | null) => {
  const res = await fetch(API_URL + url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return res.json();
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
  return res.json();
};
