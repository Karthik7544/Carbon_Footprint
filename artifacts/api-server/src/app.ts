import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { existsSync } from "node:fs";
import path from "node:path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const clientDistPath = path.resolve(__dirname, "../../carbonera/dist/public");
const clientIndexPath = path.join(clientDistPath, "index.html");

if (existsSync(clientIndexPath)) {
  app.use(express.static(clientDistPath));

  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || !req.accepts("html")) {
      next();
      return;
    }

    res.sendFile(clientIndexPath);
  });
}

export default app;
