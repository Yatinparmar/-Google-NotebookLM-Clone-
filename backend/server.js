// ===============================
// NotebookLM Clone Backend (Gemini API version - CommonJS)
// ===============================

require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

// ✅ Fix for node-fetch (ESM-only module)
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const { processPdf, searchIndex, getPageText } = require("./pdfProcessor");

// ---------- Express Setup ----------
const upload = multer({ dest: path.join(__dirname, "uploads/") });
const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for demo (not persistent)
const docs = {}; // { fileId: { filepath, index, pages } }

// ---------- Upload PDF ----------
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fileId = path.basename(file.filename);
    const filepath = file.path;

    console.log(`📄 Processing uploaded PDF: ${file.originalname}`);

    // Extract text and build search index
    const processed = await processPdf(filepath);
    docs[fileId] = { filepath, ...processed };

    console.log(`✅ PDF processed successfully. Pages: ${processed.pages.length}`);
    res.json({ fileId, pageCount: processed.pages.length });
  } catch (err) {
    console.error("❌ Error while uploading:", err);
    res.status(500).json({ error: "Failed to process PDF" });
  }
});

// ---------- Serve PDF for preview ----------
app.get("/file/:fileId", (req, res) => {
  const { fileId } = req.params;
  const entry = docs[fileId];
  if (!entry) return res.status(404).send("Not found");
  res.sendFile(path.resolve(entry.filepath));
});

// ---------- Search PDF (basic keyword search) ----------
app.post("/search/:fileId", (req, res) => {
  const { fileId } = req.params;
  const { q } = req.body;
  const entry = docs[fileId];
  if (!entry) return res.status(404).json({ error: "file not found" });

  const results = searchIndex(entry.index, q);
  const mapped = results.map((r) => {
    const page = r.ref;
    const snippet = getPageText(entry.pages, page, 200);
    return { page: parseInt(page, 10), score: r.score, snippet };
  });

  res.json({ answers: mapped.slice(0, 5) });
});

// ---------- Ask Gemini (AI Question Answering) ----------
app.post("/ask/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { q } = req.body;
    const entry = docs[fileId];
    if (!entry) return res.status(404).json({ error: "file not found" });

    console.log(`🤖 Received question: "${q}"`);

    const results = searchIndex(entry.index, q).slice(0, 4);
    const pages = results.map((r) => parseInt(r.ref, 10));
    const contextText = pages.map((p) => entry.pages[p - 1] || "").join("\n\n");

    // Prompt sent to Gemini
    const prompt = `
You are an intelligent assistant. Use the following resume content to answer the user's question accurately and concisely.
If the answer is not found in the text, say "Not mentioned in the document."

Context:
${contextText}

Question:
${q}
`;

    // Call Gemini API
    const answer = await callGemini(prompt, "gemini-1.5-flash");

    if (!answer) {
      console.error("❌ No answer received from Gemini");
      return res.status(500).json({ error: "Gemini did not return an answer" });
    }

    console.log("✅ Gemini answered:", answer.slice(0, 100) + "...");
    res.json({
      answer,
      citations: pages.map((p) => ({ page: p, label: `Page ${p}` })),
    });
  } catch (err) {
    console.error("❌ /ask route error:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
});

// ---------- Gemini API Function ----------
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key not found in .env");

  // ✅ Use latest stable model
  const model = "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ Gemini API error:", data);
    throw new Error(data.error?.message || "Gemini API call failed");
  }

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    "No meaningful response.";
  return text;
}



// ---------- Start the Server ----------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
