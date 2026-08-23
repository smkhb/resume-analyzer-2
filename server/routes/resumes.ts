import { Hono } from "hono";
import { db } from "../db";

const app = new Hono();

// Get all resumes
app.get("/", async (c) => {
  const resumes = db.query("SELECT * FROM resumes").all();
  return c.json(resumes, 200);
});

// Get a specific resume by ID
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const resume = db
    .query("SELECT * FROM resumes WHERE id = $id")
    .get({ $id: id });

  if (!resume) {
    return c.json({ error: "Resume not found." }, 404);
  }

  return c.json(resume, 200);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const resume = db
    .query("DELETE FROM resumes WHERE id = $id")
    .run({ $id: id });

  if (resume.changes === 0) {
    return c.json({ error: "Resume not found." }, 404);
  }

  return c.json({ message: "Resume deleted successfully." }, 200);
});

export default app;
