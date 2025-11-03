import React, { forwardRef, useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { fetchFileURL } from '../api';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;

const PDFViewerPanel = forwardRef(({ fileInfo }, ref) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    if (!fileInfo) return;
    setFileUrl(fetchFileURL(fileInfo.fileId));
    setPageNumber(1);
    setNumPages(fileInfo.pageCount || 0);
  }, [fileInfo]);

  // expose a method to scroll to page (viewerRef.current.goToPage(page))
  React.useImperativeHandle(ref, () => ({
    goToPage: (p) => {
      if (p >= 1 && p <= numPages) setPageNumber(p);
    }
  }));

  if (!fileInfo) return <div className="bg-white p-4 rounded shadow">No PDF loaded</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="mb-2 flex justify-between items-center">
        <div>File: {fileInfo.fileId}</div>
        <div>
          <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} className="px-2">Prev</button>
          <span className="px-2">Page {pageNumber} / {numPages || '—'}</span>
          <button onClick={() => setPageNumber(p => Math.min(numPages || p+1, p + 1))} className="px-2">Next</button>
        </div>
      </div>

      <div className="border rounded overflow-auto" style={{ height: '70vh' }}>
        {fileUrl ? (
          <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            <Page pageNumber={pageNumber} width={700} />
          </Document>
        ) : <div>Loading PDF...</div>}
      </div>
    </div>
  );
});

export default PDFViewerPanel;
