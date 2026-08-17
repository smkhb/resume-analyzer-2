import { Hono } from "hono";
import { db } from "../db";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
import { aiResponseJSONSchema, prepareInstructions } from "../constants";

const app = new Hono();

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
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfData = new PDFParse(uint8Array);
    const resumeTextResult = await pdfData.getText();
    const resumeText = resumeTextResult.text;

    const prompt = prepareInstructions({
      jobTitle,
      jobDescription,
      resumeText,
    });

    const genAIRequest = await genAI.interactions.create({
      model: "gemini-3.1-flash-lite",
      input: prompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: aiResponseJSONSchema,
      },
    });

    const genAIFeedback = genAIRequest.output_text;
    console.log("genAIFeedback", genAIFeedback);

    const cleanedFeedback = genAIFeedback
      ?.replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("cleanedFeedback", cleanedFeedback);

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
      id,
    });
  } catch (error) {
    console.error("Error processing the resume:", error);
    console.log("bro wtf is happening", error);
    return c.json({ error: "Failed to analyze the resume." }, 500);
  }
});

export default app;
