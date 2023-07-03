import { AnnualDataPoint } from "./annual-datapoint.model";
import { TimeFrame } from "./timeframe.model";

export interface PurchaseType {
    name: string;
    altName: string;
    key: keyof AnnualDataPoint;
    defaultTimeFrame: TimeFrame;
    sourceName: string;
    sourceUrl: string;
}