import React, { useState } from 'react';
import { searchFile, askFile } from '../api';

export default function ChatPanel({ fileInfo, viewerRef }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [answer, setAnswer] = useState(null);

  async function handleSearch() {
    if (!fileInfo) return alert('Upload a PDF first');
    const data = await searchFile(fileInfo.fileId, q);
    setResults(data.answers || []);
  }

  async function handleAsk() {
    if (!fileInfo) return alert('Upload a PDF first');
    const data = await askFile(fileInfo.fileId, q);
    setAnswer(data);
  }

  function jumpTo(page) {
    if (viewerRef && viewerRef.current && viewerRef.current.goToPage) {
      viewerRef.current.goToPage(page);
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-medium mb-2">Chat</h2>
      <textarea value={q} onChange={e => setQ(e.target.value)} rows={3} className="w-full border p-2" />
      <div className="mt-2 flex gap-2">
        <button onClick={handleSearch} className="px-3 py-1 bg-green-600 text-white rounded">Search</button>
        <button onClick={handleAsk} className="px-3 py-1 bg-blue-600 text-white rounded">Ask</button>
      </div>

      <div className="mt-3">
        <h3 className="font-semibold">Search Results (citations)</h3>
        {results.length === 0 && <div className="text-sm text-gray-500">No results yet</div>}
        <ul className="space-y-2 mt-2">
          {results.map((r, idx) => (
            <li key={idx} className="p-2 border rounded">
              <div className="text-sm text-gray-700">{r.snippet}</div>
              <div className="mt-1">
                <button onClick={() => jumpTo(r.page)} className="px-2 py-1 mr-2 bg-indigo-500 text-white rounded">Go to Page {r.page}</button>
                <span className="text-xs text-gray-500">score: {r.score?.toFixed(2)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {answer && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <div className="font-semibold mb-1">Answer</div>
          <pre className="whitespace-pre-wrap text-sm">{answer.answer}</pre>
          <div className="mt-2">
            {answer.citations?.map(c => (
              <button key={c.page} onClick={() => jumpTo(c.page)} className="mr-2 px-2 py-1 bg-yellow-500 rounded">Page {c.page}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
