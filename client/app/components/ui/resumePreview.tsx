import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Skeleton } from "./skeleton";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ResumePreviewProps {
  pdfUrl: string;
  width?: number;
}

export default function ResumePreview({
  pdfUrl,
  width = 450,
}: ResumePreviewProps) {
  const [isRendered, setIsRendered] = useState(false);
  
  return (
    <div className="relative w-112.5 aspect-[1/1.41] overflow-hidden rounded-md">
      {!isRendered && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      <div
        className={`transition-opacity duration-500 ease-in-out ${
          isRendered ? "opacity-100" : "opacity-0"
        }`}
      >
        <Document file={pdfUrl}>
          <Page
            pageNumber={1}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderSuccess={() => setIsRendered(true)}
          />
        </Document>
      </div>
    </div>
  );
}
