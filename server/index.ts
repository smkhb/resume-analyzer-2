import { Hono } from "hono";
import analyze from "./routes/analyze";

const app = new Hono();

app.get("/", (c) => c.text("Hello World!"));

app.route("/api/analyze", analyze);

Bun.serve({
  fetch: app.fetch,
  port: process.env.PORT,
});

console.log("Server running on port " + (process.env.PORT || 3333) + " 🚀");
