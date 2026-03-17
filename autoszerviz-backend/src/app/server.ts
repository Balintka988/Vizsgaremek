import express from "express";
import dotenv from "dotenv";
import config from "../config/config";
import routes from "../routes";
import cors from "cors";
import http from "http";
import { initWebSocket } from "./websocket";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

const server = http.createServer(app);

initWebSocket(server);

server.listen(config.port, () => {
  console.log(`Szerver elindult a ${config.port} porton`);
});