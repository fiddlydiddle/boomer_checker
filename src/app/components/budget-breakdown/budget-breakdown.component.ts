import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { AnnualDataPoint } from "src/app/datamodels/annual-datapoint.model";
import { PurchaseType } from "src/app/datamodels/purchase-type.model";
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import purchaseTypesJSON from '../../datafiles/purchase-types.json';
import * as _ from 'lodash';
import { DataFormatterService } from "src/app/services/data-formatter.service";
import { WageBracket } from "src/app/datamodels/wage-bracket.model";

interface PurchaseTypeCheckbox extends PurchaseType {
    checked: boolean;
}

@Component({
    selector: 'budget-breakdown',
    templateUrl: 'budget-breakdown.component.html',
    styleUrls: ['budget-breakdown.component.scss']
})
export class BudgetBreakdownComponent implements OnInit, OnChanges {
    
    //////////////////////////////
    //        Properties        //
    //////////////////////////////
    @Input() startYear!: number;
    @Input() endYear!: number;
    @Input() startingAnnualData!: AnnualDataPoint;
    @Input() endingAnnualData!: AnnualDataPoint;
    
    purchaseTypes: PurchaseTypeCheckbox[] = [];
    wageBrackets: WageBracket[] = [
        { name: 'Minimum Wage', key: 'minWage' as keyof AnnualDataPoint },
        { name: 'Median Wage', key: 'medianWage3rdQuintile' as keyof AnnualDataPoint },
        { name: 'Top 5% Wage', key: 'medianWageTop5Pct' as keyof AnnualDataPoint }
    ];
    selectedWageBracket = this.wageBrackets[0];
    startingBudgetValues = this.annualDataPointToMonthly(this.startingAnnualData);
    endingBudgetValues = this.annualDataPointToMonthly(this.endingAnnualData);
    dataFormatter: DataFormatterService;
    
    constructor(_dataFormatter: DataFormatterService) {
        this.dataFormatter = _dataFormatter;
        // Sort purchase types and mark them all as checked
        (purchaseTypesJSON as unknown as PurchaseType[])
            .filter(purchaseType => purchaseType.sortOrder)
            .sort((purchaseType1, purchaseType2) => {
                if ((purchaseType1.sortOrder || -1) > (purchaseType2.sortOrder || -1)) {
                    return 1;
                }
                else if ((purchaseType1.sortOrder || -1) < (purchaseType2.sortOrder || -1)) {
                    return -1;
                }
                else {
                    return 0;
                }
            })
            .forEach(purchaseType => {
                this.purchaseTypes.push({...purchaseType, checked: true});
            });
    }

    ngOnInit(): void {
        this.getBudgetData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.getBudgetData();
    }


    ///////////////////////
    //  Public methods  //
    ///////////////////////
    public purchaseTypeToggled(event: MatCheckboxChange, purchaseType: PurchaseType) {
        const selectedPurchaseType = this.purchaseTypes.find(type => type.key === purchaseType.key);
        if (selectedPurchaseType) {
            selectedPurchaseType.checked = event.checked;
        }
    }

    public calculateRemainingBudget(annualDataPoint: AnnualDataPoint, monthlyIncome: number): number {
        return monthlyIncome
            - (this.purchaseTypes.find(purchaseType => purchaseType.key === 'averageFoodCost')?.checked ? annualDataPoint.averageFoodCost : 0)
            - (this.purchaseTypes.find(purchaseType => purchaseType.key === 'medianRent')?.checked ? annualDataPoint.medianRent : 0)
            - (this.purchaseTypes.find(purchaseType => purchaseType.key === 'averageHealthcareCost')?.checked ? annualDataPoint.averageHealthcareCost : 0)
            - (this.purchaseTypes.find(purchaseType => purchaseType.key === 'averageUniversityTuition')?.checked ? annualDataPoint.averageUniversityTuition : 0)
            - (this.purchaseTypes.find(purchaseType => purchaseType.key === 'averageChildCost')?.checked ? annualDataPoint.averageChildCost : 0);
    }

    public selectedWageBracketChanged(wageBracket: WageBracket) {
        this.selectedWageBracket = wageBracket;
    }

    public getBudgetValue(annualDataPoint: AnnualDataPoint, key: keyof AnnualDataPoint) {
        return annualDataPoint[key];
    }

    ///////////////////////
    //  Private methods  //
    ///////////////////////
    private getBudgetData(): void {
        this.startingBudgetValues = this.annualDataPointToMonthly(this.startingAnnualData);
        this.endingBudgetValues = this.annualDataPointToMonthly(this.endingAnnualData);
    }

    private annualDataPointToMonthly(annualDataPoint: AnnualDataPoint): AnnualDataPoint {
        const inflationRatio = (this.endingAnnualData?.cpiValue || 0) / (annualDataPoint?.cpiValue || 1);
        return {
            minWage: (annualDataPoint?.minWage || 0) * 40 * 52 / 12 * inflationRatio,
            medianWage3rdQuintile: (annualDataPoint?.medianWage3rdQuintile || 0) / 12 * inflationRatio,
            medianWageTop5Pct: (annualDataPoint?.medianWageTop5Pct || 0) / 12 * inflationRatio,
            averageFoodCost: (annualDataPoint?.averageFoodCost || 0) / 12 * inflationRatio,
            medianRent: (annualDataPoint?.medianRent || 0) * inflationRatio,
            averageHealthcareCost: (annualDataPoint?.averageHealthcareCost || 0) / 12 * inflationRatio,
            averageUniversityTuition: (annualDataPoint?.averageUniversityTuition || 0) / 12 * inflationRatio,
            averageChildCost: (annualDataPoint?.averageChildCost || 0) / 12 * inflationRatio
        } as AnnualDataPoint;
    }
}
  