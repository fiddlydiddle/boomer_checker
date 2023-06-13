import { PurchaseType } from "./purchase-type.model";

export interface PageFilters {
    selectedYear: number;
    selectedPurchaseType: PurchaseType;
}