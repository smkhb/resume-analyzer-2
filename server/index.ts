import { Hono } from "hono";
import { cors } from "hono/cors";
import analyze from "./routes/analyze";

const app = new Hono();
app.use("/api/*", cors());

app.get("/", (c) => c.text("Hello World!"));

app.route("/api/analyze", analyze);

Bun.serve({
  fetch: app.fetch,
  port: process.env.PORT,
});

console.log("Server running on port " + (process.env.PORT || 3333) + " 🚀");
