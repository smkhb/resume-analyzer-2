import { AlertTriangle, ArrowLeft, CheckCircle, FileText } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

interface TipItem {
  type: "good" | "improve";
  tip: string;
  explanation?: string;
}

interface CategoryFeedback {
  score: number;
  tips: TipItem[];
}

interface AnalysisResult {
  overallScore: number;
  ATS: CategoryFeedback;
  toneAndStyle: CategoryFeedback;
  content: CategoryFeedback;
  structure: CategoryFeedback;
  skills: CategoryFeedback;
}

interface DBResume {
  id: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  resumePath: string;
  imagePath: string;
  feedback: AnalysisResult | null;
}

const Resume = () => {
  const { id } = useParams();
  const [resume, setResume] = useState<DBResume | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch(`http://localhost:3333/api/resumes/${id}`);
        const data = await res.json();
        console.log("Fetched resume data:", data);
        if (res.ok) {
          setResume(data);
          setAnalysis(JSON.parse(data.feedback));
        }
      } catch (err) {
        console.error("Error fetching analysis:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items=center justify-center bg-gray-50">
        <p className="text-lg font-semibold animate-pulse text-gray-600">
          Loading your AI analysis...
        </p>
      </div>
    );
  }

  if (!resume || !analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <p className="text-xl font-bold text-red-500 mb-4">
          Analysis not found!
        </p>
        <Link
          to="/"
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Go back home
        </Link>
      </div>
    );
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 texxt-green-800 hover:bg-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    return "bg-red-100 text-red-800 hover:bg-red-200";
  };

  const pdfURL = resume.resumePath?.replace(
    "./uploads/",
    "http://localhost:3333/uploads/",
  );
  const ResumePreview = lazy(() => import("~/components/ui/resumePreview"));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Job Title: {resume.jobTitle}
            </h1>
            <p className="text-sm text-gray-500">
              Applied to: {resume.companyName}
            </p>
          </div>
        </div>
      </header>

      {/* Main Split-Screen Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1600px] w-full mx-auto">
        {/* LEFT COLUMN: PDF View (Takes up 5/12 grid columns) */}
        <section className="lg:col-span-5 bg-white rounded-2xl shadow-md border h-[calc(100vh-140px)] flex flex-col overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText size={16} /> Original Resume
            </span>
            <a
              href={pdfURL}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Open in new tab
            </a>
          </div>

          <Suspense>
            <ResumePreview pdfUrl={pdfURL} />
          </Suspense>
        </section>

        {/* RIGHT COLUMN: AI Feedback (Takes up 7/12 grid columns) */}
        <section className="lg:col-span-7 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-140px)] pr-2">
          {/* Overall & ATS Score Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Score Circle */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-semibold text-gray-600">
                  Overall Matching
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <div className="relative flex items-center justify-center">
                  {/* Premium circular SVG indicator */}
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#f3f4f6"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={
                        analysis.overallScore >= 80
                          ? "#10b981"
                          : analysis.overallScore >= 50
                            ? "#f59e0b"
                            : "#ef4444"
                      }
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={351.8}
                      strokeDashoffset={
                        351.8 - (351.8 * analysis.overallScore) / 100
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-3xl font-extrabold text-gray-900">
                    {analysis.overallScore}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* ATS Score Card */}
            <Card className="shadow-md flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-semibold text-gray-600">
                  ATS Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {analysis.ATS.score}%
                  </span>
                  <Badge
                    className={`${getScoreBadgeColor(analysis.ATS.score)} text-sm font-semibold px-3 py-1`}
                  >
                    {analysis.ATS.score >= 80
                      ? "Optimized"
                      : analysis.ATS.score >= 50
                        ? "Average"
                        : "Needs Review"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    ATS Optimization Bar
                  </p>
                  <Progress value={analysis.ATS.score} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ATS Improvement Tips List */}
          <Card className="shadow-md">
            <CardHeader className="border-b bg-gray-50/50 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <CheckCircle size={20} className="text-green-500" /> ATS
                Optimization Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {analysis.ATS.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-sm text-gray-600 leading-relaxed"
                  >
                    <span className="text-green-500 font-bold">•</span>
                    tip here:
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Detailed Category Accordions */}
          <Card className="shadow-md">
            <CardHeader className="border-b bg-gray-50/50 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <AlertTriangle size={20} className="text-amber-500" /> Detailed
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {/* Accordion Item Template function to avoid repetition */}
                {(
                  [
                    ["tone", "Tone & Style", analysis.toneAndStyle],
                    ["content", "Content Quality", analysis.content],
                    ["structure", "Structure & Formatting", analysis.structure],
                    ["skills", "Skills Optimization", analysis.skills],
                  ] as const
                ).map(([key, label, data]) => (
                  <AccordionItem
                    value={key}
                    key={key}
                    className="border-b last:border-b-0 py-2"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center justify-between w-full pr-4 text-left">
                        <span className="font-semibold text-gray-900 text-md">
                          {label}
                        </span>
                        <Badge
                          className={`${getScoreBadgeColor(data.score)} px-2.5 py-0.5`}
                        >
                          {data.score}/100
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 text-sm text-gray-600 flex flex-col gap-4 leading-relaxed">
                      <div>
                        <h4 className="font-bold text-gray-800 mb-1">Tips:</h4>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2">
                          Tips to Improve:
                        </h4>
                        <ul className="list-disc pl-5 space-y-1"></ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Resume;
