export type Chapter = {
  id: string;
  title: string;
  content: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  dedication?: string;
  chapters: Chapter[];
};

export type GenerateOptions = {
  idea: string;
  pages: number; // max 300
  chapters: number;
  tone: number; // 1-10
  renameCharacters: boolean;
  author: string;
};

function rand(seed: number) {
  // simple seeded pseudo-random
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const sample = <T,>(arr: T[], r: number) => arr[Math.floor(r * arr.length) % arr.length];

export function generateBook(opts: GenerateOptions): Book {
  const seed = opts.idea.length + opts.pages * 13 + opts.chapters * 97 + opts.tone * 7;
  const vibes = ["wistful", "adventurous", "melancholic", "hopeful", "mysterious"];
  const materials = ["parchment", "ink", "quill", "vellum", "lantern"];

  const r = rand(seed);
  const vibe = sample(vibes, r * 1.13);
  const mat = sample(materials, r * 2.17);

  const title = `${opts.idea.replace(/\.$/, '')}: A ${vibe} Chronicle`;

  const dedication = `To those who dream by ${mat} light, and to ${opts.author}, whose ${vibe} heart guides every page.`;

  const chapters: Chapter[] = Array.from({ length: Math.max(1, opts.chapters) }).map((_, i) => {
    const idx = i + 1;
    const toneWords = ["gentle", "brisk", "lilting", "somber", "radiant"]; 
    const toneWord = sample(toneWords, rand(seed + idx) * 3.3);
    const title = `Chapter ${idx}: ${toneWord[0].toUpperCase()}${toneWord.slice(1)} Paths`;

    const para = (n: number) =>
      `\n\n${Array.from({ length: n })
        .map(() =>
          ` ${opts.idea} — In a ${vibe} tone (level ${opts.tone}), the tale unfolds with ${opts.renameCharacters ? "newly named" : "familiar"} figures,\n` +
          ` brushed in muted greens and warm browns, as destinies tangle like threads in a loom.`
        )
        .join("\n")}`;

    const content = `The ${mat} whispers of bygone days as our story begins.${para(3)}`;

    return { id: crypto.randomUUID(), title, content };
  });

  return {
    id: crypto.randomUUID(),
    title,
    author: opts.author || "Anonymous",
    dedication,
    chapters,
  };
}
