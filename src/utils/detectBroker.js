export function detectBroker(csvText) {
    const firstLine = csvText.split("\n")[0]?.trim();
    if (!firstLine) {
        throw new Error("Empty CSV file");
    }
    const headers = firstLine.split(",").map((h) => h.trim());
    // Zerodha-style detection
    if (headers.includes("symbol") &&
        headers.includes("trade_date") &&
        headers.includes("trade_type")) {
        return "zerodha";
    }
    // IBKR-style detection
    if (headers.includes("TradeID") &&
        headers.includes("DateTime") &&
        headers.includes("Buy/Sell")) {
        return "ibkr";
    }
    throw new Error("Unrecognized broker format");
}
//# sourceMappingURL=detectBroker.js.map