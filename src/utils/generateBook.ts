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

    const parasPerChapter = Math.max(2, Math.min(12, Math.round(opts.pages / Math.max(opts.chapters, 1) / 3)));

    const buildParagraph = (pIndex: number) => {
      const mood = `${vibe} tone (level ${opts.tone})`;
      const cast = opts.renameCharacters ? "a freshly renamed cast" : "a familiar cast";
      const textures = [
        "muted greens and warm browns",
        "soft gold light and sea-glass hues",
        "beige dawns and weathered wood",
      ];
      const texture = sample(textures, rand(seed + idx * (pIndex + 1)) * 5.7);
      return ` In a ${mood}, the narrative widens as ${cast} crosses paths,\n brushed in ${texture}, while destinies knit like threads on a loom.\n Subplots bud and secrets surface, advancing stakes without repeating the original prompt.`;
    };

    const intro = `The ${mat} whispers of bygone days as our story begins.`;
    const body = Array.from({ length: parasPerChapter })
      .map((_, j) => `\n\n${buildParagraph(j)}`)
      .join("");

    const content = `${intro}${body}`;

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
