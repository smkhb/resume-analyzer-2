import { Hono } from "hono";
import { db } from "../db";
import { cors } from "hono/cors";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
import { prepareInstructions } from "../constants";

const app = new Hono();
app.use("/api/*", cors());

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  try {
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const pdfData = new PDFParse(buffer);
    const resumeText = pdfData.getText();

    const prompt = prepareInstructions({ jobTitle, jobDescription });

    const genAIRequest = await genAI.interactions.create({
      model: "gemini-1.5-flash",
      input: prompt,
    });
    const genAIFeedback = genAIRequest.output_text;

    const cleanedFeedback = genAIFeedback
      ?.replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

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
      $feedback: cleanedFeedback || "No feedback generated.",
    });

    return c.json({
      message: "File saved and data inserted successfully!",
      id: id,
    });
  } catch (error) {
    console.error("Error processing the resume:", error);
    return c.json({ error: "Failed to analyze the resume." }, 500);
  }
});

export default app;
