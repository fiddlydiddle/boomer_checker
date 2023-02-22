import { LineChartDataPoint } from "./line-chart-data-point.model";

export interface LineChartSeries {
    name: string;
    dataPoints: LineChartDataPoint[];
}