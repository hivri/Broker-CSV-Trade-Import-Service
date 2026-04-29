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

type ZerodhaRow = {
  symbol: string;
  isin?: string;
  trade_date: string;
  trade_type: string;
  quantity: string;
  price: string;
  trade_id: string;
  order_id: string;
  exchange: string;
  segment: string;
};

function parseZerodhaDate(dateText: string): string {
  const [day, month, year] = dateText.split("-");

  if (!day || !month || !year) {
    throw new Error(`Invalid date: '${dateText}'`);
  }

  const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: '${dateText}'`);
  }

  return date.toISOString();
}

export function parseZerodhaCsv(csvText: string): ParseResult {
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as ZerodhaRow[];

  const trades: Trade[] = [];
  const errors: ParseError[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;

    try {
      const side = row.trade_type.toUpperCase();

      const quantity = Number(row.quantity);
      const price = Number(row.price);

      const executedAt = parseZerodhaDate(row.trade_date);

      const trade = TradeSchema.parse({
        symbol: row.symbol,
        side,
        quantity,
        price,
        totalAmount: side === "SELL" ? -(quantity * price) : quantity * price,
        currency: "INR",
        executedAt,
        broker: "zerodha",
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
