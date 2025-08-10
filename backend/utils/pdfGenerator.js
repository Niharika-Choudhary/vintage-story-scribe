const PDFDocument = require('pdfkit');

const generateBookPDF = async (res, book) => {
  const doc = new PDFDocument({ autoFirstPage: false, margin: 50 });

  doc.pipe(res);

  // Cover page
  doc.addPage();
  doc.fontSize(28).text(book.title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(18).text(`by ${book.author}`, { align: 'center' });
  if (book.dedication) {
    doc.moveDown(2);
    doc.fontSize(14).text(`Dedication: ${book.dedication}`, { align: 'center' });
  }

  // Table of contents
  doc.addPage();
  doc.fontSize(20).text('Table of Contents', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);
  book.chapters
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((ch, idx) => {
      doc.text(`${idx + 1}. ${ch.title}`);
    });

  // Chapters
  book.chapters
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((ch) => {
      doc.addPage();
      doc.fontSize(18).text(ch.title, { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(ch.content, { align: 'left' });
    });

  doc.end();
};

module.exports = { generateBookPDF };