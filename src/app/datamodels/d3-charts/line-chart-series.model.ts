import { LineChartDataPoint } from "./line-chart-data-point.model";

export interface LineChartSeries {
    index: number;
    name: string;
    className: string;
    dataPoints: LineChartDataPoint[];
    active: boolean;
}