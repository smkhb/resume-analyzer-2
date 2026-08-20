import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume Analyzer" },
    {
      name: "description",
      content: "Analyze your resume with our AI-powered tool!",
    },
  ];
}

export default function Home() {
  return (
    <div>
      <h2>Welcome to the Resume Analyzer!</h2>
      <Link to="/upload" className="text-blue-500 hover:underline">
        Go to Upload Page
      </Link>
    </div>
  );
}
