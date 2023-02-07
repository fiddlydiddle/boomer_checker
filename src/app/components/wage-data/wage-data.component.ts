import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { AnnualDataPoint } from "src/app/datamodels/annual-datapoint.model";
import { PurchaseType } from "src/app/datamodels/purchase-type.model";
import { TimeFrame } from "src/app/datamodels/timeframe.model";
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
    @Input() selectedPurchaseType!: PurchaseType;
    
    initialPurchaesPrice: number = 0;
    currentPurchasePrice: number = 0;
    percentChange: number = 0;
    
    constructor(public dataFormatter:DataFormatterService) {}

    ngOnInit(): void {
        this.getPurchasePrices();
    }
    ngOnChanges(changes: SimpleChanges): void {
        this.getPurchasePrices();
    }

    private getPurchasePrices(): void {
        this.initialPurchaesPrice = this.startingAnnualData[this.selectedPurchaseType.key];
        this.currentPurchasePrice = this.endingAnnualData[this.selectedPurchaseType.key];
        this.percentChange = this.dataFormatter.calculatePercentage(this.currentPurchasePrice, this.initialPurchaesPrice, false);
    }
}
  