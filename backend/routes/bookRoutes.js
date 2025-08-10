const express = require('express');
const { body, param } = require('express-validator');
const { protect } = require('../middlewares/authMiddleware');
const { createBook, getUserBooks, getBookById, editChapter, downloadBook } = require('../controllers/bookController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('title').isLength({ min: 1 }).withMessage('Title is required'),
    body('author').isLength({ min: 1 }).withMessage('Author is required'),
    body('numberOfPages').optional().isInt({ min: 1 }).withMessage('numberOfPages must be a positive integer'),
    body('chapters').optional().isInt({ min: 1 }).withMessage('chapters must be a positive integer'),
    body('toneLevel').optional().isString(),
    body('characterChangeOption').optional().isString(),
    body('mainPrompt').isLength({ min: 1 }).withMessage('mainPrompt is required'),
  ],
  createBook
);

router.get('/', getUserBooks);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid id')],
  getBookById
);

router.put(
  '/:bookId/chapters/:chapterId',
  [
    param('bookId').isMongoId(),
    param('chapterId').isMongoId(),
    body('title').optional().isString(),
    body('content').optional().isString(),
    body('regenerate').optional().isBoolean(),
  ],
  editChapter
);

router.get(
  '/:id/download',
  [param('id').isMongoId()],
  downloadBook
);

module.exports = router;