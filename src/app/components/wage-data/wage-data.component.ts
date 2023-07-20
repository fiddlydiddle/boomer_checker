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
    @Input() selectedWageBracket!: WageBracket;
    
    selectedTimeFrame: TimeFrame = { name: 'Hours', altName: 'Hourly', hourlyFactor: .0004807692308, annualFactor: 1 };
    initialWage: number = 0;
    inflationAdjustedInitialWage: number = 0;
    currentWage: number = 0;
    percentChange: number = 0;
    wageBracketWages = [
        { key: 'minWage' as keyof AnnualDataPoint, initialWage: 0, inflationAdjustedInitialWage: 0, currentWage: 0 },
        { key: 'medianWage3rdQuintile' as keyof AnnualDataPoint, initialWage: 0, inflationAdjustedInitialWage: 0, currentWage: 0 },
        { key: 'medianWageTop5Pct' as keyof AnnualDataPoint, initialWage: 0, inflationAdjustedInitialWage: 0, currentWage: 0 }
    ];
    
    constructor(public _dataFormatter:DataFormatterService) {}

    ngOnInit(): void {
        this.getWageData();
    }
    ngOnChanges(changes: SimpleChanges): void {
        this.getWageData();
    }

    private getWageData() {
        const wageFactor = this.selectedWageBracket.name === 'Minimum Wage' ? 'annualFactor' : 'hourlyFactor';
        this.initialWage = this.startingAnnualData[this.selectedWageBracket.key] * this.selectedTimeFrame[wageFactor];
        this.inflationAdjustedInitialWage = (this.endingAnnualData.cpiValue / this.startingAnnualData.cpiValue) * this.initialWage;
        this.currentWage = this.endingAnnualData[this.selectedWageBracket.key] * this.selectedTimeFrame[wageFactor];
        this.percentChange = this._dataFormatter.calculatePercentage(this.currentWage, this.initialWage, true);
        this.getWageBracketData();
    }

    private getWageBracketData() {
        const initialMinWage = this.startingAnnualData[this.wageBracketWages[0].key] * this.selectedTimeFrame.annualFactor;
        const inflationAdjustedInitialMinWage = (this.endingAnnualData.cpiValue / this.startingAnnualData.cpiValue) * initialMinWage;
        const currentMinWage = this.endingAnnualData[this.wageBracketWages[0].key] * this.selectedTimeFrame.annualFactor;

        const initialMedianWage = this.startingAnnualData[this.wageBracketWages[1].key] * this.selectedTimeFrame.hourlyFactor;
        const inflationAdjustedInitialMedianWage = (this.endingAnnualData.cpiValue / this.startingAnnualData.cpiValue) * initialMedianWage;
        const currentMedianWage = this.endingAnnualData[this.wageBracketWages[1].key] * this.selectedTimeFrame.hourlyFactor;

        const initialTopWage = this.startingAnnualData[this.wageBracketWages[2].key] * this.selectedTimeFrame.hourlyFactor;
        const inflationAdjustedInitialTopWage = (this.endingAnnualData.cpiValue / this.startingAnnualData.cpiValue) * initialTopWage;
        const currentTopWage = this.endingAnnualData[this.wageBracketWages[2].key] * this.selectedTimeFrame.hourlyFactor;

        this.wageBracketWages = [
            { key: 'minWage' as keyof AnnualDataPoint, initialWage: initialMinWage, inflationAdjustedInitialWage: inflationAdjustedInitialMinWage, currentWage: currentMinWage },
            { key: 'medianWage3rdQuintile' as keyof AnnualDataPoint, initialWage: initialMedianWage, inflationAdjustedInitialWage: inflationAdjustedInitialMedianWage, currentWage: currentMedianWage },
            { key: 'medianWageTop5Pct' as keyof AnnualDataPoint, initialWage: initialTopWage, inflationAdjustedInitialWage: inflationAdjustedInitialTopWage, currentWage: currentTopWage }
        ]
    }
}
  