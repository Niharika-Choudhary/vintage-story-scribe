import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Book, Chapter, GenerateOptions, generateBook } from "@/utils/generateBook";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const MAX_PAGES = 300;

function useDebouncedCallback<T extends any[]>(fn: (...args: T) => void, delay = 600) {
  const timer = useRef<number | undefined>(undefined);
  return (...args: T) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => fn(...args), delay);
  };
}

const BookBuilder = () => {
  const [idea, setIdea] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState(120);
  const [chapCount, setChapCount] = useState(8);
  const [tone, setTone] = useState(6);
  const [rename, setRename] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [regenPrompt, setRegenPrompt] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Book Builder | StoryForge";
    const existing = localStorage.getItem("sf_book");
    if (existing) {
      try { setBook(JSON.parse(existing)); } catch {}
    }
  }, []);

  const debouncedSave = useDebouncedCallback((b: Book) => {
    localStorage.setItem("sf_book", JSON.stringify(b));
    toast({ title: "Saved", description: "Your changes are preserved." });
  }, 1000);

  useEffect(() => {
    if (book) debouncedSave(book);
  }, [book]);

  const onGenerate = () => {
    if (!idea.trim()) {
      toast({ title: "Add your story idea", description: "Please provide a main idea to begin." });
      return;
    }
    const opts: GenerateOptions = {
      idea: idea.trim(),
      pages: Math.min(MAX_PAGES, Math.max(1, pages)),
      chapters: Math.max(1, chapCount),
      tone,
      renameCharacters: rename,
      author: author.trim() || "Anonymous",
    };
    const b = generateBook(opts);
    setBook(b);
    toast({ title: "Book generated", description: "Chapters are ready for review." });
  };

  const updateChapter = (id: string, patch: Partial<Chapter>) => {
    if (!book) return;
    const chapters = book.chapters.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setBook({ ...book, chapters });
  };

  const regenerateActiveChapter = () => {
    if (!activeChapter || !book) return;
    const base = activeChapter;
    const prompt = regenPrompt.trim();
    const newContent = prompt
      ? `Regenerated from prompt: ${prompt}\n\n${base.content}`
      : `${base.content}\n\nA fresh breeze turns the page, drawing new lines into the tale.`;
    updateChapter(base.id, { content: newContent });
    toast({ title: "Chapter updated", description: "Review the revised content." });
  };

  const onDownloadPDF = async () => {
    if (!contentRef.current) return;

    const node = contentRef.current;
    const canvas = await html2canvas(node, { scale: 2 });
    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${book?.title || "story"}.pdf`);
  };

  const toc = useMemo(() => book?.chapters.map((c, idx) => ({ idx: idx + 1, id: c.id, title: c.title })) || [], [book]);

  const clearSession = () => {
    localStorage.removeItem("sf_token");
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-secondary/60 border" />
            <h1 className="font-display text-xl">StoryForge</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onDownloadPDF} disabled={!book}>Download PDF</Button>
            <Button variant="outline" onClick={() => { localStorage.removeItem("sf_book"); setBook(null); }}>New Book</Button>
            <Button variant="destructive" onClick={clearSession}>Logout</Button>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 vintage-card p-5 paper-texture">
          <h2 className="font-display text-2xl mb-3">Create your book</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Main idea</Label>
              <Textarea placeholder="A timeworn mystery unfolds in a coastal village…" value={idea} onChange={(e) => setIdea(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Author name</Label>
              <Input placeholder="Your name" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div className="space-y-3">
              <Label>Number of pages (max {MAX_PAGES})</Label>
              <Input type="number" min={1} max={MAX_PAGES} value={pages} onChange={(e) => setPages(Math.min(MAX_PAGES, Math.max(1, Number(e.target.value) || 1)))} />
            </div>
            <div className="space-y-3">
              <Label>Number of chapters</Label>
              <Input type="number" min={1} value={chapCount} onChange={(e) => setChapCount(Math.max(1, Number(e.target.value) || 1))} />
            </div>
            <div className="space-y-3">
              <Label>Tone / Emotion level: {tone}</Label>
              <Slider value={[tone]} min={1} max={10} step={1} onValueChange={(v) => setTone(v[0])} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="rename" checked={rename} onCheckedChange={(v) => setRename(!!v)} />
              <Label htmlFor="rename">Change character names from the prompt</Label>
            </div>
            <Button className="w-full" onClick={onGenerate}>Generate Book</Button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="vintage-card p-6 paper-texture" ref={contentRef}>
            {book ? (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-1">
                  <h2 className="font-display text-3xl">{book.title}</h2>
                  <p className="text-muted-foreground">by {book.author}</p>
                </div>
                {book.dedication && (
                  <blockquote className="italic text-sm text-muted-foreground border-l-2 pl-3">{book.dedication}</blockquote>
                )}
                <div>
                  <h3 className="font-display text-xl mb-2">Table of Contents</h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    {toc.map((t) => (
                      <li key={t.id} className="story-link">
                        <a href={`#${t.id}`}>{t.idx}. {t.title}</a>
                      </li>
                    ))}
                  </ol>
                </div>

                <Accordion type="multiple" className="w-full">
                  {book.chapters.map((c) => (
                    <AccordionItem key={c.id} value={c.id} id={c.id}>
                      <AccordionTrigger className="font-display text-lg">{c.title}</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex justify-end mb-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="secondary" size="sm" onClick={() => { setActiveChapter(c); setRegenPrompt(""); }}>Edit Chapter</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="font-display">Edit {c.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-3">
                                <Label>Chapter text</Label>
                                <Textarea value={activeChapter?.id === c.id ? activeChapter.content : c.content}
                                  onChange={(e) => setActiveChapter({ ...(activeChapter?.id === c.id ? activeChapter! : c), content: e.target.value })}
                                  className="min-h-[200px]" />
                                <div className="space-y-2">
                                  <Label>Regenerate with a prompt (optional)</Label>
                                  <Input placeholder="e.g., Make the scene more mysterious with ocean motifs" value={regenPrompt} onChange={(e) => setRegenPrompt(e.target.value)} />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setActiveChapter(null)}>Cancel</Button>
                                <Button onClick={() => {
                                  if (activeChapter) updateChapter(activeChapter.id, { content: activeChapter.content });
                                  regenerateActiveChapter();
                                  setActiveChapter(null);
                                }}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <Textarea value={c.content} onChange={(e) => updateChapter(c.id, { content: e.target.value })} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Use the panel to the left to generate your book. Your work auto-saves here.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default BookBuilder;
