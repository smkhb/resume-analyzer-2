import { Link } from "react-router";
import type { Route } from "./+types/home";
import { lazy, Suspense, useEffect, useState } from "react";
import { Calendar, FileUp, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
const ResumePreview = lazy(() => import("~/components/ui/resumePreview"));

interface ResumeListItem {
  id: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  resumePath: string;
  feedback: string;
  createdAt: string;
}

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
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResumes = async () => {
    try {
      const res = await fetch("http://localhost:3333/api/resumes");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to fetch resumes: ${res.status}`);
      }
      setResumes(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unknown error occurred: ${error}`;
      console.error("Error fetching resumes:", error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (
    id: string,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      const res = await fetch(`http://localhost:3333/api/resumes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to delete resume: ${res.status}`);
      }
      setResumes((prevResumes) =>
        prevResumes.filter((resume) => resume.id !== id),
      ); // Update the state to remove the deleted resume
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unknown error occurred: ${error}`;
      console.error("Error deleting resume:", error);
      setError(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  const getOverallScore = (feedbackStr: string) => {
    try {
      const parsed = JSON.parse(feedbackStr);
      return parsed.overallScore || "N/A";
    } catch (error) {
      console.error("Error parsing feedback JSON:", error);
      return "Error";
    }
  };

  function PdfSkeleton() {
    return (
      <div className="w-112.5 aspect-[1/1.41] relative rounded-md overflow-hidden bg-muted/40 border border-dashed border-muted-foreground/20 flex items-center justify-center">
        <Skeleton className="w-full h-full absolute inset-0" />
        <div className="relative z-10 flex items-center justify-center">
          <Loader2 className="h-24 w-24 animate-spin " />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between shadow-md sticky top-0 z-50 dark:bg-gray-950 min-h-20">
        <h1 className="text-xl font-bold ">Resume Analyzer</h1>
        <Link
          to="/upload"
          className=" hover:text-blue-500 transition ease-in-out"
        >
          <FileUp size={20} />
        </Link>
      </header>
      <main className="flex flex-1 gap-6 p-6 max-w-[1600px] w-full justify-center mx-auto">
        {loading ? (
          <section className="flex flex-1 items-center justify-center">
            <div className="relative z-10 flex items-center justify-center">
              <Loader2 className="h-24 w-24 animate-spin" />
            </div>
          </section>
        ) : resumes.length === 0 ? (
          <section className="flex flex-1 flex-col items-center justify-center border-2 border-dashed rounded-2xl p-16 text-center max-w-xl mx-auto shadow-md">
            <div className="p-4 rounded-full mb-6 shadow-md">
              <FileUp size={48} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">No resumes found</h2>
            <p className="text-gray-600 mb-6">
              You haven't uploaded any resumes yet. Click the button below to
              get started.
            </p>
            <Link to="/upload">
              <Button size="lg" className="flex items-center gap-2">
                <Plus size={18} /> Upload Resume
              </Button>
            </Link>
          </section>
        ) : (
          <section className="flex flex-wrap gap-6">
            {resumes.map((resume) => {
              const score = getOverallScore(resume.feedback);
              const pdfURL = resume.resumePath?.replace(
                "./uploads/",
                "http://localhost:3333/uploads/",
              );
              return (
                <Link
                  to={`/resumes/${resume.id}`}
                  key={resume.id}
                  className="block group"
                >
                  <Card className="hover:shadow-lg transition-all duration-300 border overflow-hidden relative cursor-pointer w-full max-w-md">
                    <div
                      className={`h-1.5 w-full ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                    />
                    <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                      <div className="space-y-1 pr-4">
                        <CardTitle className="text-lg font-bold">
                          {resume.jobTitle}
                        </CardTitle>
                        <CardDescription className="text-sm font-medium">
                          {resume.companyName}
                        </CardDescription>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-sm border ${score >= 80 ? "border-green-500" : score >= 60 ? "border-yellow-500" : "border-red-500"} `}
                      >
                        {score}%
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-between">
                      <Suspense fallback={<PdfSkeleton />}>
                        <ResumePreview pdfUrl={pdfURL} />
                      </Suspense>

                      <div className="w-full flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar size={13} />
                          <span>{formatDate(resume.createdAt)}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={(e) => handleDelete(resume.id, e)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
