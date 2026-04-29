import { type Trade } from "../schema/trade.js";
type ParseError = {
    row: number;
    reason: string;
};
type ParseResult = {
    trades: Trade[];
    errors: ParseError[];
};
export declare function parseZerodhaCsv(csvText: string): ParseResult;
export {};
//# sourceMappingURL=zerodhaParser.d.ts.map