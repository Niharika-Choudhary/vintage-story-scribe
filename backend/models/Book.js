const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: true }
);

const bookSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    dedication: { type: String },
    numberOfPages: { type: Number },
    toneLevel: { type: String },
    characterChangeOption: { type: String },
    mainPrompt: { type: String },
    chapters: [chapterSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);