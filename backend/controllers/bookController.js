const { validationResult } = require('express-validator');
const Book = require('../models/Book');
const { generateBookContent, regenerateChapterContent } = require('../utils/aiService');
const { generateBookPDF } = require('../utils/pdfGenerator');

exports.createBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const userId = req.user.id;
  const {
    title,
    author,
    dedication,
    numberOfPages,
    chapters,
    toneLevel,
    characterChangeOption,
    mainPrompt,
  } = req.body;

  try {
    const generated = await generateBookContent({
      title,
      author,
      dedication,
      numberOfPages,
      chapters,
      toneLevel,
      characterChangeOption,
      mainPrompt,
    });

    const book = await Book.create({
      user: userId,
      title,
      author,
      dedication,
      numberOfPages,
      toneLevel,
      characterChangeOption,
      mainPrompt,
      chapters: generated.chapters,
    });

    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create book' });
  }
};

exports.getUserBooks = async (req, res) => {
  try {
    const books = await Book.find({ user: req.user.id }).select('-mainPrompt');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch books' });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, user: req.user.id });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch book' });
  }
};

exports.editChapter = async (req, res) => {
  const { bookId, chapterId } = req.params;
  const { title, content, regenerate } = req.body;

  try {
    const book = await Book.findOne({ _id: bookId, user: req.user.id });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const chapter = book.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    if (regenerate) {
      const regenerated = await regenerateChapterContent({
        book,
        chapterOrder: chapter.order,
      });
      chapter.content = regenerated.content;
      if (regenerated.title) chapter.title = regenerated.title;
    } else {
      if (typeof title === 'string') chapter.title = title;
      if (typeof content === 'string') chapter.content = content;
    }

    await book.save();
    res.json({ message: 'Chapter updated', chapter });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update chapter' });
  }
};

exports.downloadBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, user: req.user.id });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const filename = `${book.title.replace(/\s+/g, '_')}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    await generateBookPDF(res, book);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
};