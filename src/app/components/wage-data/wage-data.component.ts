import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { AnnualDataPoint } from "src/app/datamodels/annual-datapoint.model";
import { PurchaseType } from "src/app/datamodels/purchase-type.model";
import { TimeFrame } from "src/app/datamodels/timeframe.model";
import { WageBracket } from "src/app/datamodels/wage-bracket.model";
import { DataFormatterService } from "src/app/services/data-formatter.service";


@Component({
    selector: 'wage-data',
    templateUrl: 'wage-data.component.html'
})
export class WageDataComponent implements OnInit, OnChanges {
    
    //////////////////////////////
    //        Properties        //
    //////////////////////////////
    @Input() startYear!: number;
    @Input() endYear!: number;
    @Input() startingAnnualData!: AnnualDataPoint;
    @Input() endingAnnualData!: AnnualDataPoint;
    @Input() selectedTimeFrame!: TimeFrame;
    @Input() selectedWageBracket!: WageBracket;
    
    initialWage: number = 0;
    inflationAdjustedWage: number = 0;
    currentWage: number = 0;
    percentChange: number = 0;
    
    constructor(public _dataFormatter:DataFormatterService) {}

    ngOnInit(): void {
        this.getWageData();
    }
    ngOnChanges(changes: SimpleChanges): void {
        this.getWageData();
    }

    private getWageData() {
        this.initialWage = this.startingAnnualData[this.selectedWageBracket.key];
        this.inflationAdjustedWage = (this.endingAnnualData.cpiValue / this.startingAnnualData.cpiValue) * this.initialWage;
        this.currentWage = this.endingAnnualData[this.selectedWageBracket.key];
        this.percentChange = this._dataFormatter.calculatePercentage(this.currentWage, this.initialWage, true);
    }
}
  