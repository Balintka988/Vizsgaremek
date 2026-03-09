import type http from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import config from "../config/config";


const clientsByUser = new Map<number, Set<WebSocket>>();

function addClient(userId: number, ws: WebSocket) {
  const set = clientsByUser.get(userId) ?? new Set<WebSocket>();
  set.add(ws);
  clientsByUser.set(userId, set);
}

function removeClient(userId: number, ws: WebSocket) {
  const set = clientsByUser.get(userId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) clientsByUser.delete(userId);
}

export function initWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    let boundUserId: number | null = null;

    (ws as any).isAlive = true;
    ws.on("pong", () => {
      (ws as any).isAlive = true;
    });

    ws.on("message", (raw) => {
      try {
        const text = raw.toString();
        const msg = JSON.parse(text);

        if (msg?.type === "join") {
          const token = String(msg?.token || "");
          if (!token) {
            ws.close(1008, "Token szükséges");
            return;
          }

          const decoded: any = jwt.verify(token, config.jwtSecret);
          const userId = Number(decoded?.id);
          if (!userId) {
            ws.close(1008, "Érvénytelen user");
            return;
          }

          boundUserId = userId;
          addClient(userId, ws);
          ws.send(JSON.stringify({ type: "joined", userId }));
          return;
        }
      } catch (_err) {
      }
    });

    ws.on("close", () => {
      if (boundUserId) removeClient(boundUserId, ws);
    });

    ws.on("error", () => {
      if (boundUserId) removeClient(boundUserId, ws);
    });
  });

  const interval = setInterval(() => {
    for (const ws of wss.clients) {
      if ((ws as any).isAlive === false) {
        ws.terminate();
        continue;
      }
      (ws as any).isAlive = false;
      ws.ping();
    }
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  return wss;
}

export function sendToUser(userId: number, payload: any) {
  const set = clientsByUser.get(Number(userId));
  if (!set || set.size === 0) return;
  const data = JSON.stringify(payload);
  for (const ws of set) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}
