const pdfMakePrinter = require("pdfmake");
const path = require("path");

const fonts = {
  Roboto: {
    normal: path.join(__dirname, "..", "public", "fonts/Roboto/Roboto-Regular.ttf"),
    bold: path.join(__dirname, "..", "public", "fonts/Roboto/Roboto-Medium.ttf"),
    italics: path.join(__dirname, "..", "public", "fonts/Roboto/Roboto-Italic.ttf"),
    bolditalics: path.join(
      __dirname,
      "..",
      "public",
      "fonts/Roboto/Roboto-MediumItalic.ttf"
    ),
  },
};

exports.generatePdf = (docDefinition, callback) => {
  try {
    // const fontDescriptors = { ... };
    const printer = new pdfMakePrinter(fonts);
    const doc = printer.createPdfKitDocument(docDefinition);

    let chunks = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      const result = Buffer.concat(chunks);
      callback(result);
    });

    doc.end();
  } catch (err) {
    throw err;
  }
};
