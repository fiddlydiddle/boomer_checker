import { Injectable } from "@angular/core";
import { AnnualDataPoint } from "../datamodels/annual-datapoint.model";
import { ValueInflationPoint } from "../datamodels/value-inflation.model";

@Injectable({
    providedIn: 'root'
})
export class PriceChartService {

    public getPriceData(annualData: AnnualDataPoint[], startingYear: number, selectedPurchaseType: keyof AnnualDataPoint): ValueInflationPoint[] {
        let priceData: ValueInflationPoint[] = [];
        annualData.forEach(dataPoint => {
            if (dataPoint.year >= startingYear) {
                let thisDataPoint = this.getPriceDataPoint(dataPoint, priceData, selectedPurchaseType);
                priceData.push(thisDataPoint);
            }
        });
        return priceData;
    };
    
    private getPriceDataPoint(dataPoint: AnnualDataPoint, priceData: ValueInflationPoint[], selectedPurchaseType: keyof AnnualDataPoint): ValueInflationPoint {
        let thisDataPoint: ValueInflationPoint = {
            year: dataPoint.year,
            cpiValue: dataPoint.cpiValue,
            dollarValue: dataPoint[selectedPurchaseType],
            inflationAdjustedDollarValue: 0
        };

        if (priceData.length === 0) {
            thisDataPoint.inflationAdjustedDollarValue = dataPoint[selectedPurchaseType];
        }
        else {
            let previousDataPoint: ValueInflationPoint = priceData[priceData.length - 1];
            thisDataPoint.inflationAdjustedDollarValue = (dataPoint.cpiValue / previousDataPoint.cpiValue) * previousDataPoint.inflationAdjustedDollarValue;
        }

        return thisDataPoint;
    }
}