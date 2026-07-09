import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("/api/*", cors());

app.get("/", (c) => {
  return c.text("Hello Bun + Hono!");
});

Bun.serve({
  fetch: app.fetch,
  port: process.env.PORT || 3333,
});

console.log("Server running on port " + (process.env.PORT || 3333) + " 🚀");
