import { Database } from "bun:sqlite";

const db = new Database("resume.sqlite", { create: true });

db.run(`
  CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    companyName TEXT,
    jobTitle TEXT,
    jobDescription TEXT,
    resumePath TEXT,
    imagePath TEXT,
    feedback TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log("✅ SQLite Database initialized successfully!");

export { db };
