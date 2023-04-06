import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { AnnualDataPoint } from "src/app/datamodels/annual-datapoint.model";
import { TimeFrame } from "src/app/datamodels/timeframe.model";
import { PurchaseType } from "src/app/datamodels/purchase-type.model";
import { WorkTimeChartService } from "src/app/services/work-time-chart.service";
import { WorkTimeChartModel } from "src/app/datamodels/work-time-chart.model";
import { DataArrayConverterService } from "src/app/services/data-array-converter.service";
import { LineChartSeries } from "src/app/datamodels/d3-charts/line-chart-series.model";

@Component({
    selector: 'work-time-chart',
    templateUrl: 'work-time-chart.component.html',
    styleUrls: []
})
export class WorkTimeChartComponent implements OnInit, OnChanges {
    //////////////////////////////
    //        Properties        //
    //////////////////////////////
    @Input() startYear!: number;
    @Input() endYear!: number;
    @Input() annualData!: AnnualDataPoint[];
    @Input() purchaseType!: PurchaseType;
    @Input() timeFrames!: TimeFrame[];
    _selectedTimeFrame: TimeFrame = { name: 'Hours', altName: 'Hourly', hourlyFactor: .0004807692308, annualFactor: 1 };
    @Input() 
        get selectedTimeFrame() {
            return this._selectedTimeFrame;
        }
        set selectedTimeFrame(value: TimeFrame) {
            this.selectedTimeFrameChange.emit(value);
            this._selectedTimeFrame = value;
            this.updateChart();
        }
    @Output() selectedTimeFrameChange: EventEmitter<TimeFrame> = new EventEmitter<TimeFrame>();

    workTimeChart: any = {
        title: '',
        type: 'LineChart',
        data: [],
        columns: [
          {name: 'Year', label: 'Year', type: 'string'},
          {name: 'Minimum Wage', label: 'Minimum Wage', type: 'number'},
          {name: 'Median Wage', label: 'Median Wage', type: 'number'},
          {name: 'Top 5% Wage', label: 'Top 5% Wage', type: 'number'}
        ],
        options: { 'legend': { 'position': 'top' } }
    };

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
        let visibleColumns: string[] = ['year', 'minWageWorkTime', 'medianWageWorkTime', 'top5PctWorkTime']
        let dataArray: any[] = this._dataArrayConverter.convert(chartData, visibleColumns);
        this.workTimeChart.title = `${this._selectedTimeFrame.name} of Work Required to Purchase over Time`;
        this.workTimeChart.data = Object.assign([], dataArray);
        this.workTimeDataSeries = [];
        this.workTimeDataSeries.push({
            name: 'Min Wage',
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
  