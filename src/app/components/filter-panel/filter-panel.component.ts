import { Component, Input } from "@angular/core";
import { PageFilters } from "src/app/datamodels/page-filters.model";


@Component({
    selector: 'filter-panel',
    templateUrl: 'filter-panel.component.html'
})
export class FilterPanelComponent {
    
    //////////////////////////////
    //        Properties        //
    //////////////////////////////
    @Input() filters!: PageFilters;
    
    constructor() {}

    // ngOnInit(): void {
    //     this.getPurchasePrices();
    // }
    // ngOnChanges(changes: SimpleChanges): void {
    //     this.getPurchasePrices();
    // }

    // private getPurchasePrices(): void {
    //     this.initialPurchaesPrice = this.startingAnnualData[this.selectedPurchaseType.key];
    //     this.currentPurchasePrice = this.endingAnnualData[this.selectedPurchaseType.key];
    //     this.percentChange = this.dataFormatter.calculatePercentage(this.currentPurchasePrice, this.initialPurchaesPrice, false);
    // }
}
  