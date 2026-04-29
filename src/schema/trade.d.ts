import { z } from "zod";
export declare const TradeSchema: z.ZodObject<{
    symbol: z.ZodString;
    side: z.ZodEnum<{
        BUY: "BUY";
        SELL: "SELL";
    }>;
    quantity: z.ZodNumber;
    price: z.ZodNumber;
    totalAmount: z.ZodNumber;
    currency: z.ZodString;
    executedAt: z.ZodString;
    broker: z.ZodString;
    rawData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
export type Trade = z.infer<typeof TradeSchema>;
//# sourceMappingURL=trade.d.ts.map