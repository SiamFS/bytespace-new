// Vercel entry point (Express preset: a root file that imports express and default-exports the app —
// Vercel docs "Express on Vercel"). It serves the compiled app from dist/, which the build step in
// vercel.json produces with our own tsc settings, the same output the Docker image runs.
// Locally, Docker and CI start the API with src/server.ts instead.
import express from "express";
import { createApp } from "./dist/app.js";

export default express().disable("x-powered-by").use(createApp());
