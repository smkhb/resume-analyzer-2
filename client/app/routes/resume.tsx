import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  FileText,
  Loader2,
  TriangleAlert,
} from "lucide-react";
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
import { Skeleton } from "~/components/ui/skeleton";

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
        if (res.ok) {
          setResume(data);
          setAnalysis(JSON.parse(data.feedback));
          console.log("Fetched analysis:", JSON.parse(data.feedback));
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
      <div className="min-h-screen flex items=center justify-center ">
        <p className="text-lg font-semibold animate-pulse ">
          Loading your AI analysis...
        </p>
      </div>
    );
  }

  if (!resume || !analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
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
      {/* Top Header Bar */}
      <header className=" border-b px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50 dark:bg-gray-950 min-h-20">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover: rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Job Title: {resume.jobTitle}</h1>
            <p className="text-sm ">Applied to: {resume.companyName}</p>
          </div>
        </div>
      </header>

      {/* Main Split-Screen Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1600px] w-full mx-auto">
        {/* LEFT COLUMN: PDF View (Takes up 5/12 grid columns) */}
        <section className="lg:col-span-5 rounded-2xl shadow-md border flex flex-col overflow-hidden">
          <div className=" px-4 py-3 border-b flex items-center justify-between">
            <span className="text-sm font-semibold flex items-center gap-2">
              <FileText size={16} /> Original Resume
            </span>
            <a
              href={pdfURL}
              target="_blank"
              rel="noreferrer"
              className="text-xs hover:underline font-medium"
            >
              Open in new tab
            </a>
          </div>

          <Suspense fallback={<PdfSkeleton />}>
            <ResumePreview pdfUrl={pdfURL} />
          </Suspense>
        </section>

        {/* RIGHT COLUMN: AI Feedback (Takes up 7/12 grid columns) */}
        <section className="lg:col-span-7 flex flex-col gap-6 pr-2">
          {/* Overall & ATS Score Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Score Circle */}
            <Card className="shadow-md">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold ">
                  Resume Review
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center">
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
                    <span className="absolute text-3xl font-extrabold">
                      {analysis.overallScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-center ">
                    {/* Score description */}
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl font-bold">Your Resume Score</h2>
                      <span>
                        This score is calculated based on the variables listed
                        below.
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <p className="font-semibold mb-1">Tone & Style</p>
                    <Badge
                      className={`${getScoreBadgeColor(analysis.toneAndStyle.score)} px-3 py-1`}
                    >
                      {analysis.ATS.score >= 80
                        ? "Optimized"
                        : analysis.ATS.score >= 50
                          ? "Average"
                          : "Needs Review"}
                    </Badge>
                  </div>
                  <span>{analysis.toneAndStyle.score}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <p className="font-semibold mb-1">Structure</p>
                    <Badge
                      className={`${getScoreBadgeColor(analysis.structure.score)} px-3 py-1`}
                    >
                      {analysis.ATS.score >= 80
                        ? "Optimized"
                        : analysis.ATS.score >= 50
                          ? "Average"
                          : "Needs Review"}
                    </Badge>
                  </div>
                  <span>{analysis.structure.score}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <p className="font-semibold mb-1">Content</p>
                    <Badge
                      className={`${getScoreBadgeColor(analysis.content.score)} px-3 py-1`}
                    >
                      {analysis.ATS.score >= 80
                        ? "Optimized"
                        : analysis.ATS.score >= 50
                          ? "Average"
                          : "Needs Review"}
                    </Badge>
                  </div>
                  <span>{analysis.content.score}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <p className="font-semibold mb-1">Skills</p>
                    <Badge
                      className={`${getScoreBadgeColor(analysis.skills.score)} px-3 py-1`}
                    >
                      {analysis.ATS.score >= 80
                        ? "Optimized"
                        : analysis.ATS.score >= 50
                          ? "Average"
                          : "Needs Review"}
                    </Badge>
                  </div>
                  <span>{analysis.skills.score}/100</span>
                </div>
              </CardContent>
            </Card>

            {/* ATS Score Card */}
            <Card className="shadow-md">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold ">
                  ATS Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-extrabold ">
                    {analysis.ATS.score}/100
                  </span>
                  <Badge
                    className={`${getScoreBadgeColor(analysis.ATS.score)} text-sm px-3 py-1`}
                  >
                    {analysis.ATS.score >= 80
                      ? "Optimized"
                      : analysis.ATS.score >= 50
                        ? "Average"
                        : "Needs Review"}
                  </Badge>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold mb-1">
                    How well does your resume pass through Applicant Tracking
                    Systems (ATS)?
                  </span>
                  <p>
                    Your resume was scanned like an employer would. Here's how
                    it performed:
                  </p>
                  <ul className="flex flex-col gap-2 list-disc list-inside mt-2">
                    {analysis.ATS.tips.map((tip, index) => (
                      <li key={index} className="flex flex-col leading-relaxed">
                        <span className="font-semibold">{tip.tip}</span>
                        {tip.explanation}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Content Tips List */}
            <Accordion type="multiple">
              <AccordionItem
                value="content-tips"
                className="border-b last:botder-b-0"
              >
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <span>Content</span>
                    <Badge
                      className={`${getScoreBadgeColor(analysis.content.score)} text-sm px-3 py-1`}
                    >
                      {analysis.content.score}/100
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4 pb-6 pt-2">
                    <ul className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted/50 rounded-lg border">
                      {analysis.content.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-center leading-relaxed gap-2"
                        >
                          {tip.type === "good" ? (
                            <CheckCircle className="text-green-500 shrink-0" />
                          ) : (
                            <TriangleAlert className="text-yellow-500 shrink-0" />
                          )}
                          <span className="font-medium text-foreground">
                            {tip.tip}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {analysis.content.tips.map((tip, index) => {
                      const isGoodTip = tip.type === "good";
                      return (
                        <div
                          key={index}
                          className={`flex items-start gap-3 rounded-lg border p-4 shadow-sm transition-colors ${
                            isGoodTip
                              ? "border-green-500/30 bg-green-500/10 text-foreground"
                              : "border-yellow-500/30 bg-yellow-500/10 text-foreground"
                          } `}
                        >
                          <div className="shrink-0">
                            {isGoodTip ? (
                              <CheckCircle className="text-green-500" />
                            ) : (
                              <TriangleAlert className="text-yellow-500" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1 leading-relaxed">
                            <span
                              className={`font-semibold ${
                                isGoodTip
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-yellow-600 dark:text-yellow-400"
                              }`}
                            >
                              {tip.tip}
                            </span>
                            {tip.explanation && (
                              <p className="text-muted-foreground">
                                {tip.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Skills Tips List */}
            <Accordion type="multiple">
              <AccordionItem
                value="content-tips"
                className="border-b last:botder-b-0"
              >
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <span>Skills</span>
                    <Badge
                      className={`${getScoreBadgeColor(analysis.skills.score)} text-sm px-3 py-1`}
                    >
                      {analysis.skills.score}/100
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4 pb-6 pt-2">
                    <ul className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted/50 rounded-lg border">
                      {analysis.skills.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-center leading-relaxed gap-2"
                        >
                          {tip.type === "good" ? (
                            <CheckCircle className="text-green-500 shrink-0" />
                          ) : (
                            <TriangleAlert className="text-yellow-500 shrink-0" />
                          )}
                          <span className="font-medium text-foreground">
                            {tip.tip}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {analysis.skills.tips.map((tip, index) => {
                      const isGoodTip = tip.type === "good";
                      return (
                        <div
                          key={index}
                          className={`flex items-start gap-3 rounded-lg border p-4 shadow-sm transition-colors ${
                            isGoodTip
                              ? "border-green-500/30 bg-green-500/10 text-foreground"
                              : "border-yellow-500/30 bg-yellow-500/10 text-foreground"
                          } `}
                        >
                          <div className="shrink-0">
                            {isGoodTip ? (
                              <CheckCircle className="text-green-500" />
                            ) : (
                              <TriangleAlert className="text-yellow-500" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1 leading-relaxed">
                            <span
                              className={`font-semibold ${
                                isGoodTip
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-yellow-600 dark:text-yellow-400"
                              }`}
                            >
                              {tip.tip}
                            </span>
                            {tip.explanation && (
                              <p className="text-muted-foreground">
                                {tip.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Tone & Style Tips List */}
            <Accordion type="multiple">
              <AccordionItem
                value="content-tips"
                className="border-b last:botder-b-0"
              >
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <span>Tone & Style</span>
                    <Badge
                      className={`${getScoreBadgeColor(analysis.toneAndStyle.score)} text-sm px-3 py-1`}
                    >
                      {analysis.toneAndStyle.score}/100
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4 pb-6 pt-2">
                    <ul className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted/50 rounded-lg border">
                      {analysis.toneAndStyle.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-center leading-relaxed gap-2"
                        >
                          {tip.type === "good" ? (
                            <CheckCircle className="text-green-500 shrink-0" />
                          ) : (
                            <TriangleAlert className="text-yellow-500 shrink-0" />
                          )}
                          <span className="font-medium text-foreground">
                            {tip.tip}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {analysis.toneAndStyle.tips.map((tip, index) => {
                      const isGoodTip = tip.type === "good";
                      return (
                        <div
                          key={index}
                          className={`flex items-start gap-3 rounded-lg border p-4 shadow-sm transition-colors ${
                            isGoodTip
                              ? "border-green-500/30 bg-green-500/10 text-foreground"
                              : "border-yellow-500/30 bg-yellow-500/10 text-foreground"
                          } `}
                        >
                          <div className="shrink-0">
                            {isGoodTip ? (
                              <CheckCircle className="text-green-500" />
                            ) : (
                              <TriangleAlert className="text-yellow-500" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1 leading-relaxed">
                            <span
                              className={`font-semibold ${
                                isGoodTip
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-yellow-600 dark:text-yellow-400"
                              }`}
                            >
                              {tip.tip}
                            </span>
                            {tip.explanation && (
                              <p className="text-muted-foreground">
                                {tip.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Resume;
