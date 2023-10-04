import cors from "cors";
import dotenv from "dotenv";
import express, { ErrorRequestHandler, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import logger from "./logger"; // Importando o logger
import apiRoutes from "./routes/routes";

dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
});

const server = express();

server.use(limiter);
server.use(helmet());
server.use(cors());
server.use(express.static(path.join(__dirname, "../public")));
server.use(express.json());

server.get("/ping", (req: Request, res: Response) => {
  logger.info("Endpoint /ping acessado."); // Log de auditoria
  res.json({ pong: true });
});

server.use(apiRoutes);

server.use((req: Request, res: Response) => {
  res.status(404);
  res.json({ error: "Endpoint não encontrado." });
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(400); // Bad Request
  console.log(err);
  res.json({ error: "Ocorreu algum erro." });
};
server.use(errorHandler);

server.listen(process.env.PORT);
