import { parse } from "csv-parse/sync";
import { TradeSchema } from "../schema/trade.js";
function parseZerodhaDate(dateText) {
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
export function parseZerodhaCsv(csvText) {
    const rows = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });
    const trades = [];
    const errors = [];
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
        }
        catch (error) {
            errors.push({
                row: rowNumber,
                reason: error instanceof Error ? error.message : "Unknown parsing error",
            });
        }
    });
    return { trades, errors };
}
//# sourceMappingURL=zerodhaParser.js.map