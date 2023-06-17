import { PurchaseType } from "./purchase-type.model";

export interface PageFilters {
    selectedStartingYear: number;
    selectedPurchaseType: PurchaseType;
}