const fs = require("fs");
const pdfParse = require("pdf-parse");
const lunr = require("lunr");

async function processPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const parsed = await pdfParse(dataBuffer);

  const pages = (parsed.text || "")
    .split("\f")
    .map((s) => s.trim())
    .filter(Boolean);

  const idx = lunr(function () {
    this.ref("page");
    this.field("content");
    pages.forEach((pText, i) => {
      this.add({ page: String(i + 1), content: pText });
    });
  });

  return { pages, index: idx };
}

function searchIndex(idx, q) {
  try {
    return idx.search(q);
  } catch {
    return [];
  }
}

function getPageText(pages, pageRef, length = 200) {
  const pageIndex = parseInt(pageRef, 10) - 1;
  if (pageIndex < 0 || pageIndex >= pages.length) return "";
  const text = pages[pageIndex];
  return text.length > length ? text.slice(0, length) + "..." : text;
}

module.exports = { processPdf, searchIndex, getPageText };
