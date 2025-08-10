import { Book, GenerateOptions, generateBook } from "@/utils/generateBook";

export async function generateBookAI(opts: GenerateOptions): Promise<Book> {
  // Attempt backend AI endpoint; fall back to local generator if unavailable
  try {
    const res = await fetch("/api/ai/generate-book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...opts,
        instructions:
          "Write a full book starting with a title page (with title and author), a dedication, a table of contents, then chapter-by-chapter narrative. Maintain creativity, avoid repeating the input text verbatim, and expand ideas naturally. Respect the requested number of pages and chapters, apply the tone/emotion level, and if renameCharacters is true, change character names. Use elegant, literary prose.",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      // Accept either { book } or the book directly
      const book = (data?.book ?? data) as Book;
      if (book && book.title && Array.isArray(book.chapters)) return book;
    }
  } catch (_) {
    // ignore and fall back
  }
  return generateBook(opts);
}

export async function downloadBookPdf(bookId: string, fileName: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/books/${bookId}/pdf`, { method: "GET" });
    const ct = res.headers.get("Content-Type") || "";
    if (!res.ok || !ct.includes("application/pdf")) return false;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  } catch (_) {
    return false;
  }
}
