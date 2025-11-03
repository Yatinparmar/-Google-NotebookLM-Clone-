// frontend/src/api.js
import axios from 'axios';
const BASE = 'http://localhost:4000';

export async function uploadPDF(file) {
  const fd = new FormData();
  fd.append('pdf', file);
  const r = await axios.post(`${BASE}/upload`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return r.data; // { fileId, pageCount }
}

export async function fetchFileURL(fileId) {
  return `${BASE}/file/${fileId}`;
}

export async function searchFile(fileId, query) {
  const r = await axios.post(`${BASE}/search/${fileId}`, { q: query });
  return r.data; // { answers: [...] }
}

export async function askFile(fileId, query) {
  const r = await axios.post(`${BASE}/ask/${fileId}`, { q: query });
  return r.data;
}
