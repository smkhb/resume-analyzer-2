import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => setFile(acceptedFiles[0] || null),
    accept: { "application/pdf": [".pdf"] },
    maxSize: 20 * 1024 * 1024, // 20MB in bytes
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData(e.currentTarget);
    formData.append("resume", file);

    try {
      const res = await fetch("http://localhost:3333/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        console.log("Saved to SQLite!", data);
        console.log("Resume ID:", data.resumeId);
      } else {
        console.error("Error: " + data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl  rounded-2xl shadow-md p-8 border">
        <h1 className="text-3xl font-bold mb-2 text-center">Resume Analyzer</h1>
        <h2 className="mb-8 text-center">
          Drop your resume for an ATS score and improvement tips
        </h2>

        {isProcessing ? (
          <div className="text-center py-10">
            {/* We will add the scanning GIF here later */}
            <p className="text-lg font-semibold animate-pulse">{statusText}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="e.g. Google"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                placeholder="e.g. Frontend Developer"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea
                id="jobDescription"
                name="jobDescription"
                placeholder="Paste the full job description here..."
                rows={10}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Upload Resume (PDF)</Label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors bg-input/30 ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-input hover:border-ring hover:border-ring-3"
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <p className="font-semibold">{file.name}</p>
                ) : (
                  <p className="text-muted-foreground ">
                    Drag & drop your PDF here, or click to select
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full">
              Analyze Resume
            </Button>
          </form>
        )}
      </div>
    </main>
  );
};

export default Upload;
