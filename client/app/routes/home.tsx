import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume Analyzer" },
    { name: "description", content: "Analyze your resume with our AI-powered tool!" },
  ];
}

export default function Home() {
  return <div>Welcome to the Resume Analyzer!</div>;
}
