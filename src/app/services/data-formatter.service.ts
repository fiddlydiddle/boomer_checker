import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class DataFormatterService {
    formatCurrency (value: number) {
        return value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        });
    };

    formatNumber (value: number, numDecimals: number) {
        return value.toLocaleString(undefined, { maximumFractionDigits: numDecimals, minimumFractionDigits: numDecimals });
    };

    calculatePercentage (value1: number, value2: number, returnAbsoluteValue: boolean = false) {
        const ratio: number = value1 / value2 - 1;
        let asPercentage: number = ratio * 100;
        asPercentage = Math.round(asPercentage);

        if (returnAbsoluteValue) {
            asPercentage = Math.abs(asPercentage);
        }
        
        return asPercentage;
    }

    formatPercentage (value: number) {
        return value.toLocaleString("en-US", {
            style: "number"
        });
    };
}