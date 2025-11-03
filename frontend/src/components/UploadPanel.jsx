import React, { useState } from 'react';
import { uploadPDF } from '../api';

export default function UploadPanel({ onUploaded }) {
  const [f, setF] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!f) return alert('select a pdf');
    setLoading(true);
    try {
      const data = await uploadPDF(f);
      onUploaded(data);
      alert('Uploaded! fileId: ' + data.fileId);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-medium mb-2">Upload PDF</h2>
      <input type="file" accept="application/pdf" onChange={e => setF(e.target.files[0])} />
      <div className="mt-3">
        <button onClick={handleUpload} className="px-3 py-1 bg-indigo-600 text-white rounded" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
}
