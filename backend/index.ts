// Vercel entry point. Vercel's Express preset looks for a root `index.ts` that imports express and
// default-exports the app (Vercel docs "Express on Vercel" → "Exporting the Express application").
// Locally, Docker and CI start the API with src/server.ts instead.
import express from "express";
import { createApp } from "./src/app.js";

const app = express();
app.disable("x-powered-by");
app.use(createApp());

export default app;
