import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { AnnualDataPoint } from "src/app/datamodels/annual-datapoint.model";
import { TimeFrame } from "src/app/datamodels/timeframe.model";
import { WorkTimeModel } from "src/app/datamodels/work-time.model";
import { WageComparisonComponent } from "../wage-comparison/wage-comparison.component";
import $ from 'jquery';
import { PurchaseType } from "src/app/datamodels/purchase-type.model";
import { DataFormatterService } from "src/app/services/data-formatter.service";

@Component({
    selector: 'work-time',
    templateUrl: 'work-time.component.html',
    styleUrls: []
})
export class WorkTimeComponent implements OnInit, OnChanges {
    //////////////////////////////
    //        Properties        //
    //////////////////////////////
    @Input() startYear!: number;
    @Input() endYear!: number;
    @Input() purchaseStartingPrice!: number;
    @Input() purchaseCurrentPrice!: number;
    @Input() startingAnnualData!: AnnualDataPoint;
    @Input() endingAnnualData!: AnnualDataPoint;
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
            this.getData();
        }
    @Output() selectedTimeFrameChange: EventEmitter<TimeFrame> = new EventEmitter<TimeFrame>();
    
    @ViewChild(WageComparisonComponent, { static: true }) wageComparison!: WageComparisonComponent;

    startingWorkTimes: WorkTimeModel = { minWageWorkTime: 0, medianWageWorkTime: 0, top5PctWorkTime: 0};
    endingWorkTimes: WorkTimeModel = { minWageWorkTime: 0, medianWageWorkTime: 0, top5PctWorkTime: 0};
    wageComparisonVisible: boolean = false;
    _dataFormatter: DataFormatterService;

    constructor(public dataFormatter: DataFormatterService) {
        this._dataFormatter = dataFormatter;
    }

    ngOnInit(): void {
        this.getData();
    }

    ngOnChanges(): void {
        this.getData();
    }

    public absoluteValue(value: number) {
        return Math.abs(value);
    }

    public toggleWageData(event: any, year: string) {
        this.wageComparison.visible = !this.wageComparison.visible;
        if (this.wageComparison.visible) {
            // set data of child wage-comparison component
            let selectedYear: number = this.startYear;
            let yearData: AnnualDataPoint = this.startingAnnualData;
            if (year !== 'startYear') {
                selectedYear = this.endYear;
                yearData = this.endingAnnualData;
            }
            this.wageComparison.selectedYear = selectedYear;
            this.wageComparison.data = yearData;
            this.wageComparison.visible = true;
            $('#wage-comparison .wage-comparison').css({
                top: event.pageY + 5,
                left: event.pageX
            });
        }
    }

    private getData(): void {
        this.startingWorkTimes = this.calcWorkTimes(this.purchaseStartingPrice, this.startingAnnualData);
        this.endingWorkTimes = this.calcWorkTimes(this.purchaseCurrentPrice, this.endingAnnualData);
    }

    private calcWorkTimes(purchasePrice: number, annualData: AnnualDataPoint): WorkTimeModel {
        return {
            minWageWorkTime: purchasePrice / (this.selectedTimeFrame.annualFactor * annualData.minWage),
            medianWageWorkTime: purchasePrice / (this.selectedTimeFrame.hourlyFactor * annualData.medianWage3rdQuintile),
            top5PctWorkTime: purchasePrice / (this.selectedTimeFrame.hourlyFactor * annualData.medianWageTop5Pct)
        };
    }
}
  