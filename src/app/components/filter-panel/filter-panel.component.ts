import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { PageFilters } from "src/app/datamodels/page-filters.model";
import { PurchaseType } from "src/app/datamodels/purchase-type.model";
import purchaseTypesJSON from '../../datafiles/purchase-types.json';

@Component({
    selector: 'filter-panel',
    templateUrl: 'filter-panel.component.html',
    styleUrls: ['./filter-panel.component.scss']
})
export class FilterPanelComponent implements OnInit {
    
    //////////////////////////////
    //        Properties        //
    //////////////////////////////
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

    purchaseTypes: PurchaseType[] = purchaseTypesJSON as unknown as PurchaseType[];
    _filters: PageFilters = {
        selectedStartingYear: 0,
        selectedPurchaseType: this.purchaseTypes[0]
    }

    filterSelections: PageFilters = {
        selectedStartingYear: 0,
        selectedPurchaseType: this.purchaseTypes[0]
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
  