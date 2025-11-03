import { useState } from "react";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadPdf = async () => {
    if (!file) return alert("Select a PDF first");
    setLoading(true);
    const formData = new FormData();
    formData.append("pdf", file);
    const res = await fetch("http://localhost:4000/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setFileId(data.fileId);
    setPageCount(data.pageCount);
    setLoading(false);
  };

  const askQuestion = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await fetch(`http://localhost:4000/ask/${fileId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: query }),
    });
    const data = await res.json();
    setAnswer(data.answer);
    setResults([]);
    setLoading(false);
  };

  const searchPdf = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const res = await fetch(`http://localhost:4000/search/${fileId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: query }),
    });
    const data = await res.json();
    setResults(data.answers);
    setAnswer("");
    setLoading(false);
  };

  return (
    <div className="app-wrapper">
      <div className="main-card">
        <header className="header">
          <h1>📘 NotebookLM Clone</h1>
          <p>Ask and explore your PDFs effortlessly</p>
        </header>

        <div className="upload-section">
          <h2>Upload PDF</h2>
          <div className="upload-box">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button onClick={uploadPdf} disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
          {fileId && (
            <p className="uploaded-text">
              ✅ Uploaded <b>{file.name}</b> ({pageCount} pages)
            </p>
          )}
        </div>

        {fileId && (
          <>
            <div className="query-section">
              <h2>Ask or Search in PDF</h2>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask something from your PDF..."
              />
              <div className="btn-group">
                {/* <button onClick={searchPdf} disabled={loading} className="btn-blue">
                  🔍 Search
                </button> */}
                <button onClick={askQuestion} disabled={loading} className="btn-purple">
                  💬 Ask
                </button>
              </div>
            </div>

            {loading && <p className="loading">Processing...</p>}

            {results.length > 0 && (
              <div className="result-section">
                <h3>Search Results</h3>
                {results.map((r, i) => (
                  <div key={i} className="result-card">
                    <p className="meta">Page {r.page} — Score {r.score.toFixed(2)}</p>
                    <p>{r.snippet}</p>
                  </div>
                ))}
              </div>
            )}

            {answer && (
              <div className="answer-section">
                <h3>AI Answer</h3>
                <pre>{answer}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
