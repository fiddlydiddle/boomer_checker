import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { AnnualDataPoint } from "src/app/datamodels/annual-datapoint.model";
import { TimeFrame } from "src/app/datamodels/timeframe.model";
import { PurchaseType } from "src/app/datamodels/purchase-type.model";
import { WorkTimeChartService } from "src/app/services/work-time-chart.service";
import { WorkTimeChartModel } from "src/app/datamodels/work-time-chart.model";
import { DataArrayConverterService } from "src/app/services/data-array-converter.service";
import { LineChartSeries } from "src/app/datamodels/d3-charts/line-chart-series.model";
import { LineChartRaceComponent } from "../d3-charts/line-chart-race/line-chart-race.component";

@Component({
    selector: 'work-time-chart',
    templateUrl: 'work-time-chart.component.html',
    styleUrls: []
})
export class WorkTimeChartComponent implements OnInit, OnChanges {
    @ViewChild('workTimeChart', {static: false}) workTimeChart: LineChartRaceComponent | undefined;

    //////////////////////////////
    //        Properties        //
    //////////////////////////////
    @Input() startYear!: number;
    @Input() endYear!: number;
    @Input() annualData!: AnnualDataPoint[];
    @Input() timeFrames!: TimeFrame[];
    
    private _selectedTimeFrame: TimeFrame = { name: 'Hours', altName: 'Hourly', hourlyFactor: .0004807692308, annualFactor: 1 };
    @Input() 
        get selectedTimeFrame() {
            return this._selectedTimeFrame;
        }
        set selectedTimeFrame(value: TimeFrame) {
            this.selectedTimeFrameChange.emit(value);
            this._selectedTimeFrame = value;
            this.workTimeChart?.stopAnimation();
            this.updateChart();
        }
    @Output() selectedTimeFrameChange: EventEmitter<TimeFrame> = new EventEmitter<TimeFrame>();

    private _purchaseType: PurchaseType = { 
        name: 'Year\'s University Tuition',
        altName: 'University Tuition',
        key: 'averageUniversityTuition',
        defaultTimeFrame: { name: 'Years', altName: 'Annual', hourlyFactor: 1, annualFactor: 2080 } };
    @Input()
        get purchaseType() {
            return this._purchaseType;
        }
        set purchaseType(value: PurchaseType) {
            this._purchaseType = value;
            this.updateChart();
        }


    workTimeDataSeries: LineChartSeries[] = [];

    constructor(private _workTimeChartService: WorkTimeChartService, private _dataArrayConverter: DataArrayConverterService) { }

    ngOnInit(): void {
        this.updateChart();
    }

    ngOnChanges(): void {
        this.updateChart();
    }

    private updateChart() {
        let chartData: WorkTimeChartModel[] = this._workTimeChartService.getWorkTimeDataData(this.annualData, this.startYear, this.purchaseType, this._selectedTimeFrame);
        this.workTimeDataSeries = [];
        this.workTimeDataSeries.push({
            name: 'Minimum Wage',
            className: 'minimum-wage-time',
            dataPoints: chartData.map(dataPoint => {
                return { year: dataPoint.year, value: dataPoint.minWageWorkTime };
            })
        });
        this.workTimeDataSeries.push({
            name: 'Median Wage',
            className: 'median-wage-time',
            dataPoints: chartData.map(dataPoint => {
                return { year: dataPoint.year, value: dataPoint.medianWageWorkTime };
            })
        });
        this.workTimeDataSeries.push({
            name: 'Top 5% Wage',
            className: 'top5pct-wage-time',
            dataPoints: chartData.map(dataPoint => {
                return { year: dataPoint.year, value: dataPoint.top5PctWorkTime };
            })
        });
    }
}
  