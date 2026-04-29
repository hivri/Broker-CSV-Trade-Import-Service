import { parse } from "csv-parse/sync";
import { TradeSchema } from "../schema/trade.js";
function normalizeSymbol(symbol) {
    if (symbol === "EUR.USD") {
        return "EUR/USD";
    }
    return symbol;
}
function normalizeSide(value) {
    if (value === "BOT")
        return "BUY";
    if (value === "SLD")
        return "SELL";
    throw new Error(`Invalid side: '${value}'`);
}
function parseIbkrDate(dateText) {
    const date = new Date(dateText);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid date: '${dateText}'`);
    }
    return date.toISOString();
}
export function parseIbkrCsv(csvText) {
    const rows = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
    });
    const trades = [];
    const errors = [];
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
//# sourceMappingURL=ibkrParser.js.map