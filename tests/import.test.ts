import { describe, expect, it } from "vitest";
import { detectBroker } from "../src/utils/detectBroker.js";
import { parseZerodhaCsv } from "../src/parsers/zerodhaParser.js";
import { parseIbkrCsv } from "../src/parsers/ibkrParser.js";

const zerodhaCsv = `symbol,isin,trade_date,trade_type,quantity,price,trade_id,order_id,exchange,segment
RELIANCE,INE002A01018,01-04-2026,buy,10,2450.50,TRD001,ORD001,NSE,EQ
INFY,INE009A01021,01-04-2026,sell,25,1520.75,TRD002,ORD002,NSE,EQ
RELIANCE,INE002A01018,invalid_date,buy,10,2480.00,TRD006,ORD006,NSE,EQ
WIPRO,INE075A01022,05-04-2026,buy,-5,450.00,TRD007,ORD007,NSE,EQ`;

const ibkrCsv = `TradeID,AccountID,Symbol,DateTime,Buy/Sell,Quantity,TradePrice,Currency,Commission,NetAmount,AssetClass
U1234-001,U1234567,AAPL,2026-04-01T14:30:00Z,BOT,100,185.50,USD,-1.00,18549.00,STK
U1234-002,U1234567,MSFT,2026-04-01T15:45:00Z,SLD,50,420.25,USD,-1.00,-21011.50,STK
U1234-003,U1234567,EUR.USD,2026-04-02T09:00:00Z,BOT,10000,1.0850,USD,-2.00,10848.00,CASH
U1234-004,U1234567,TSLA,04/03/2026,BOT,25,245.00,USD,-1.00,6124.00,STK
U1234-005,U1234567,AMZN,2026-04-03T16:20:00Z,SLD,0,190.75,USD,-1.00,0.00,STK
U1234-006,U1234567,GOOGL,2026-04-04T10:15:00Z,BOT,30,175.50,USD,,5265.00,STK`;

describe("broker detection", () => {
  it("detects Zerodha CSV", () => {
    expect(detectBroker(zerodhaCsv)).toBe("zerodha");
  });

  it("detects IBKR CSV", () => {
    expect(detectBroker(ibkrCsv)).toBe("ibkr");
  });

  it("throws for empty CSV", () => {
    expect(() => detectBroker("")).toThrow("Empty CSV file");
  });

  it("throws for unknown CSV format", () => {
    expect(() => detectBroker("name,age\nabc,10")).toThrow(
      "Unrecognized broker format"
    );
  });
});

describe("Zerodha parser", () => {
  it("parses valid rows and skips invalid rows", () => {
    const result = parseZerodhaCsv(zerodhaCsv);

    expect(result.trades).toHaveLength(2);
    expect(result.errors).toHaveLength(2);
    expect(result.trades[0]?.broker).toBe("zerodha");
    expect(result.trades[1]?.side).toBe("SELL");
  });
});

describe("IBKR parser", () => {
  it("parses valid rows and skips invalid rows", () => {
    const result = parseIbkrCsv(ibkrCsv);

    expect(result.trades).toHaveLength(5);
    expect(result.errors).toHaveLength(1);
    expect(result.trades[2]?.symbol).toBe("EUR/USD");
    expect(result.trades[1]?.side).toBe("SELL");
  });
});
