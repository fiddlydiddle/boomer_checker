import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { PageFilters } from "src/app/datamodels/page-filters.model";
import { PurchaseType } from "src/app/datamodels/purchase-type.model";
import { TimeFrame } from "src/app/datamodels/timeframe.model";


@Component({
    selector: 'filter-panel',
    templateUrl: 'filter-panel.component.html'
})
export class FilterPanelComponent implements OnInit {
    
    //////////////////////////////
    //        Properties        //
    //////////////////////////////
    _filters: PageFilters = {
        selectedStartingYear: 0,
        selectedPurchaseType: { name: 'Year\'s University Tuition', altName: 'University Tuition', key: 'averageUniversityTuition', defaultTimeFrame: { name: 'Hours', altName: 'Hourly', hourlyFactor: .0004807692308, annualFactor: 1 } }
    }
    @Input()
        get filters() {
            return this._filters;
        }
        set filters(value: PageFilters) {
            this.filtersChange.emit(value);
            this._filters = value;
        }
    @Output() filtersChange: EventEmitter<PageFilters> = new EventEmitter<PageFilters>();
    
    @Input() allowedYears!: number[];
    @Input() purchaseTypes!: PurchaseType[];

    filterSelections: PageFilters = {
        selectedStartingYear: 0,
        selectedPurchaseType: { name: 'Year\'s University Tuition', altName: 'University Tuition', key: 'averageUniversityTuition', defaultTimeFrame: { name: 'Hours', altName: 'Hourly', hourlyFactor: .0004807692308, annualFactor: 1 } }
    };

    constructor() {}

    ngOnInit(): void {
        this.filterSelections = {
            selectedStartingYear: this.filters.selectedStartingYear,
            selectedPurchaseType: this.filters.selectedPurchaseType
        };
    }

    /////////////////////
    // Public Methods
    /////////////////////
    applyFilters() {
        this.filters = {
            selectedStartingYear: this.filterSelections.selectedStartingYear,
            selectedPurchaseType: this.filterSelections.selectedPurchaseType
        };
    }
}
  