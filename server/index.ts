import { Hono } from "hono";
import { cors } from "hono/cors";
import analyze from "./routes/analyze";

const app = new Hono();
app.use("/api/*", cors());

app.route("/api/analyze", analyze);

console.log("Server running on port " + (process.env.PORT || 3333) + " 🚀");
