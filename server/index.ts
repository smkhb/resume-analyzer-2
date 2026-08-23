import { serveStatic } from "hono/bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import analyze from "./routes/analyze";
import resumes from "./routes/resumes";

const app = new Hono();
app.use("/*", cors());
app.use("/uploads/*", serveStatic({ root: "./" }));

app.get("/", (c) => c.text("Hello World!"));

app.route("/api/analyze", analyze);
app.route("/api/resumes", resumes);

Bun.serve({
  fetch: app.fetch,
  port: process.env.PORT,
});

console.log("Server running on port " + (process.env.PORT || 3333) + " 🚀");
