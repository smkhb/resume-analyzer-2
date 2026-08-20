import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ResumePreview({ pdfUrl }: { pdfUrl: string }) {
  return (
    <div className="flex justify-center overflow-hidden">
      <Document file={pdfUrl}>
        <Page
          pageNumber={1}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          width={450}
        />
      </Document>
    </div>
  );
}
