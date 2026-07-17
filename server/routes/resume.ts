import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "../db";

const app = new Hono();
app.use("/api/*", cors());

app.get("/resumes/:id", async (c) => {
  const id = c.req.param("id");
  const query = db
    .query("SELECT * FROM resumes WHERE id = $id")
    .get({ $id: id });

  return c.json(query || { error: "Resume not found." }, query ? 200 : 404);
});

export default app;
