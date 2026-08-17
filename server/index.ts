import { Hono } from "hono";
import analyze from "./routes/analyze";
import resume from "./routes/resume";
import { cors } from "hono/cors";

const app = new Hono();
app.use("/api/*", cors());

app.get("/", (c) => c.text("Hello World!"));

app.route("/api/analyze", analyze);
app.route("/api/resumes", resume);

Bun.serve({
  fetch: app.fetch,
  port: process.env.PORT,
});

console.log("Server running on port " + (process.env.PORT || 3333) + " 🚀");
