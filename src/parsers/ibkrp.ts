import { parse } from "csv-parse/sync";
import { TradeSchema, type Trade } from "../schema/trade.js";
import { z } from "zod";
type ParseError = {
  row: number;
  reason: string;
};

type ParseResult = {
  trades: Trade[];
  errors: ParseError[];
};

type IbkrRow = {
  TradeID: string;
  AccountID: string;
  Symbol: string;
  DateTime: string;
  "Buy/Sell": string;
  Quantity: string;
  TradePrice: string;
  Currency: string;
  Commission?: string;
  NetAmount?: string;
  AssetClass?: string;
};

function normalizeSymbol(symbol: string): string {
  if (symbol === "EUR.USD") {
    return "EUR/USD";
  }

  return symbol;
}

function normalizeSide(value: string): "BUY" | "SELL" {
  if (value === "BOT") return "BUY";
  if (value === "SLD") return "SELL";

  throw new Error(`Invalid side: '${value}'`);
}

function parseIbkrDate(dateText: string): string {
  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: '${dateText}'`);
  }

  return date.toISOString();
}

export function parseIbkrCsv(csvText: string): ParseResult {
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as IbkrRow[];

  const trades: Trade[] = [];
  const errors: ParseError[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;

    try {
      const side = normalizeSide(row["Buy/Sell"]);
      const quantity = Number(row.Quantity);
      const price = Number(row.TradePrice);
      const executedAt = parseIbkrDate(row.DateTime);

      const trade = TradeSchema.parse({
        symbol: normalizeSymbol(row.Symbol),
        side,
        quantity,
        price,
        totalAmount: side === "SELL" ? -(quantity * price) : quantity * price,
        currency: row.Currency,
        executedAt,
        broker: "ibkr",
        rawData: row,
      });

      trades.push(trade);
    } catch (error) {
      let reason = "Unknown parsing error";

      if (error instanceof z.ZodError) {
        reason = error.issues.map((issue) => issue.message).join(", ");
      } else if (error instanceof Error) {
        reason = error.message;
      }

      errors.push({
        row: rowNumber,
        reason,
      });
    }
  });

  return { trades, errors };
}
