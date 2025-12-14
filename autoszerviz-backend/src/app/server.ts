import express from "express";
import dotenv from "dotenv";
import config from "../config/config";
import routes from "../routes";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.listen(config.port, () => {
  console.log(`Szerver elindult a ${config.port} porton`);
});
