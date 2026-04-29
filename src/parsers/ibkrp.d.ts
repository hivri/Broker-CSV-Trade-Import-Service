import { type Trade } from "../schema/trade.js";
type ParseError = {
    row: number;
    reason: string;
};
type ParseResult = {
    trades: Trade[];
    errors: ParseError[];
};
export declare function parseIbkrCsv(csvText: string): ParseResult;
export {};
//# sourceMappingURL=ibkrp.d.ts.map