import express from "express";
import multer from "multer";

import { detectBroker } from "./utils/detectBroker.js";
import { parseZerodhaCsv } from "./parsers/zerodhaParser.js";
import { parseIbkrCsv } from "./parsers/ibkrParser.js";

const app = express();
const upload = multer();

const PORT = 3000;

app.post("/import", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "CSV file is required",
      });
    }

    const csvText = req.file.buffer.toString("utf-8");

    const broker = detectBroker(csvText);

    let result;

    if (broker === "zerodha") {
      result = parseZerodhaCsv(csvText);
    } else {
      result = parseIbkrCsv(csvText);
    }

    return res.json({
      broker,
      summary: {
        total: result.trades.length + result.errors.length,
        valid: result.trades.length,
        skipped: result.errors.length,
      },
      trades: result.trades,
      errors: result.errors,
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
