import { AnnualDataPoint } from "./annual-datapoint.model";

export interface WageBracket {
    name: string;
    key: keyof AnnualDataPoint;
}