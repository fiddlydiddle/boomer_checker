import { Injectable } from "@angular/core";
import { AnnualDataPoint } from "../datamodels/annual-datapoint.model";
import { PurchaseType } from "../datamodels/purchase-type.model";
import { TimeFrame } from "../datamodels/timeframe.model";
import { ValueInflationPoint } from "../datamodels/value-inflation.model";
import { WorkTimeChartModel } from "../datamodels/work-time-chart.model";

@Injectable({
    providedIn: 'root'
})
export class WorkTimeChartService {

    public getWorkTimeDataData(annualData: AnnualDataPoint[], startingYear: number, purchaseType: PurchaseType, timeframe: TimeFrame): WorkTimeChartModel[] {
        let workTimeData: WorkTimeChartModel[] = [];
        annualData.forEach(annualDataPoint => {
            if (annualDataPoint.year >= startingYear) {
                let thisDataPoint = this.getWorkTimeDataPoint(annualDataPoint, workTimeData, purchaseType, timeframe);
                workTimeData.push(thisDataPoint);
            }
        });
        return workTimeData;
    };
    
    private getWorkTimeDataPoint(annualDataPoint: AnnualDataPoint, workTimeData: WorkTimeChartModel[], purchaseType: PurchaseType, timeframe: TimeFrame): WorkTimeChartModel {
        let purchaseAmount = annualDataPoint[purchaseType.key];

        let thisDataPoint: WorkTimeChartModel = {
            year: annualDataPoint.year,
            minWageAmount: annualDataPoint.minWage * timeframe.annualFactor,
            minWageWorkTime: purchaseAmount / (annualDataPoint.minWage * timeframe.annualFactor),
            medianWageAmount: annualDataPoint.medianWage3rdQuintile * timeframe.hourlyFactor,
            medianWageWorkTime: purchaseAmount / (annualDataPoint.medianWage3rdQuintile * timeframe.hourlyFactor),
            top5PctAmount: annualDataPoint.medianWageTop5Pct * timeframe.hourlyFactor,
            top5PctWorkTime: purchaseAmount / (annualDataPoint.medianWageTop5Pct * timeframe.hourlyFactor)
        };
        return thisDataPoint;
    }
}