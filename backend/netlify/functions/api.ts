// YOUR_BASE_DIRECTORY/netlify/functions/api.ts

import express, { Router } from "express";
import serverless from "serverless-http";

const api = express();

const router = Router();
router.get("/hello", (req, res) => res.send("Hello World! from netlify")); //router.get router will add `/api/` to the path

api.use("/api/", router);

export const handler = serverless(api);
