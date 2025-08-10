const generateRepeatedText = (seed, repeatCount) => {
  return Array.from({ length: repeatCount })
    .map(() => seed)
    .join(' ');
};

const generateBookContent = async ({ title, author, numberOfPages, chapters = 5, toneLevel, mainPrompt }) => {
  const numChapters = Number.isInteger(chapters) ? chapters : 5;
  const estimatedWords = (numberOfPages || 10) * 250;
  const wordsPerChapter = Math.max(200, Math.floor(estimatedWords / numChapters));

  const chapterList = Array.from({ length: numChapters }).map((_, idx) => {
    const chTitle = `Chapter ${idx + 1}`;
    const seed = `An AI-generated passage for ${chTitle} of "${title}" by ${author}. Prompt: "${mainPrompt}". Tone: "${toneLevel || 'neutral'}".`;
    return {
      title: chTitle,
      order: idx + 1,
      content: generateRepeatedText(seed, Math.ceil(wordsPerChapter / 12)),
    };
  });

  return { chapters: chapterList };
};

const regenerateChapterContent = async ({ book, chapterOrder }) => {
  const chTitle = `Chapter ${chapterOrder}`;
  const seed = `Regenerated content for ${chTitle} of "${book.title}" by ${book.author}. Tone: "${book.toneLevel || 'neutral'}".`;
  return {
    title: chTitle,
    content: generateRepeatedText(seed, 60),
  };
};

module.exports = { generateBookContent, regenerateChapterContent };