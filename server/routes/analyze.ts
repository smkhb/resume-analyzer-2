import { Hono } from "hono";
import { db } from "../db";

const app = new Hono();

app.post("/", async (c) => {
  const body = await c.req.parseBody();

  const resumeFile = body["resume"] as File;
  const companyName = body["companyName"] as string;
  const jobTitle = body["jobTitle"] as string;
  const jobDescription = body["jobDescription"] as string;

  if (!resumeFile) {
    return c.json({ error: "Resume file was not uploaded." }, 400);
  }

  const id = crypto.randomUUID();
  const resumePath = `./uploads/${id}-${resumeFile.name}`;

  await Bun.write(resumePath, resumeFile);

  const aiFeedback = JSON.stringify({
    message: "AI feedback will be generated here.",
  });

  const insert = db.prepare(`
    INSERT INTO resumes (id, companyName, jobTitle, jobDescription, resumePath, imagePath, feedback)
    VALUES ($id, $companyName, $jobTitle, $jobDescription, $resumePath, $imagePath, $feedback)
    `);

  insert.run({
    $id: id,
    $companyName: companyName,
    $jobTitle: jobTitle,
    $jobDescription: jobDescription,
    $resumePath: resumePath,
    $imagePath: "", // I will handle the image preview conversion later
    $feedback: aiFeedback,
  });

  return c.json({
    message: "File saved and data inserted successfully!",
    id: id,
  });
});

export default app;
