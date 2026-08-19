import z from "zod";

const tipSchema = z.object({
  type: z.enum(["good", "improve"]),
  tip: z
    .string()
    .describe("A short title for the actual explanation of the tip"),
  explanation: z.string().describe("A detailed explanation of the tip"),
});

const categoryFeedbackSchema = z.object({
  score: z.number().max(100),
  tips: z.array(tipSchema),
});

export const aiResponseZodSchema = z.object({
  overallScore: z.number().max(100).describe("Max score is 100"),
  ATS: z.object({
    score: z.number().describe("Rate based on ATS suitability"),
    tips: z.array(
      z.object({
        type: z.enum(["good", "improve"]),
        tip: z.string().describe("Give 3-4 tips"),
      }),
    ),
  }),
  toneAndStyle: z.object({
    categoryFeedbackSchema,
  }),
  content: z.object({
    categoryFeedbackSchema,
  }),
  structure: z.object({
    categoryFeedbackSchema,
  }),
  skills: z.object({
    categoryFeedbackSchema,
  }),
});

export const aiResponseJSONSchema = z.toJSONSchema(aiResponseZodSchema);

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
  resumeText,
}: {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
}) =>
  `You are an expert in ATS (Applicant Tracking System) and resume analysis.
      Please analyze and rate this resume and suggest how to improve it.
      The rating can be low if the resume is bad.
      Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
      If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
      If available, use the job description for the job user is applying to to give more detailed feedback.
      If provided, take the job description into consideration.
      The job title is: ${jobTitle}
      The job description is: ${jobDescription}
      The resume is: ${resumeText}`;
