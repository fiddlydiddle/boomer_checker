import { Component, OnInit } from "@angular/core";
import { DataArrayConverterService } from "src/app/services/data-array-converter.service";
import allWageProgressionData from '../../datafiles/average-wages-per-quintile.json';
import { WageProgressionChartModel } from '../../datamodels/wage-progression-chart.model';

@Component({
    selector: 'wage-progression',
    templateUrl: 'wage-progression.component.html',
    styleUrls: ['wage-progression.component.scss']
})
export class WageProgressionComponent implements OnInit {
    //////////////////////////////
    //        Properties        //
    //////////////////////////////
   
    wageProgressionNominalChart: any = {
        title: '',
        type: 'LineChart',
        data: [],
        columns: [
          {name: 'Year', label: 'Year', type: 'string'},
          {name: 'Bottom 20%', label: 'Bottom 20%', type: 'number'},
          {name: 'Second 20%', label: 'Second 20%', type: 'number'},
          {name: 'Middle 20%', label: 'Middle 20%', type: 'number'},
          {name: 'Third 20%', label: 'Third 20%', type: 'number'},
          {name: 'Top 20%', label: 'Top 20%', type: 'number'},
        ],
        options: { 
            'legend': { 'position': 'top' },
            vAxis: { 
                maxValue: 275000,
                viewWindow: {
                    max: 275000,
                    min: 0
                }
            }
        }
    };

    wageProgressionRealChart: any = {
        title: '',
        type: 'LineChart',
        data: [],
        columns: [
          {name: 'Year', label: 'Year', type: 'string'},
          {name: 'Bottom 20%', label: 'Bottom 20%', type: 'number'},
          {name: 'Second 20%', label: 'Second 20%', type: 'number'},
          {name: 'Middle 20%', label: 'Middle 20%', type: 'number'},
          {name: 'Third 20%', label: 'Third 20%', type: 'number'},
          {name: 'Top 20%', label: 'Top 20%', type: 'number'},
        ],
        options: { 
            'legend': { 'position': 'top' },
            vAxis: { 
                maxValue: 275000,
                viewWindow: {
                    max: 275000,
                    min: 0
                }
            }
        }
    };

    wageProgressionNominalPctChart: any = {
        title: '',
        type: 'LineChart',
        data: [],
        columns: [
          {name: 'Year', label: 'Year', type: 'string'},
          {name: 'Bottom 20%', label: 'Bottom 20%', type: 'number'},
          {name: 'Second 20%', label: 'Second 20%', type: 'number'},
          {name: 'Middle 20%', label: 'Middle 20%', type: 'number'},
          {name: 'Third 20%', label: 'Third 20%', type: 'number'},
          {name: 'Top 20%', label: 'Top 20%', type: 'number'},
        ],
        options: { 
            'legend': { 'position': 'top' },
            vAxis: { 
                maxValue: 5.5,
                minValue: -.25,
                viewWindow: {
                    max: 5.5,
                    min: -.25
                }
            }
        }
    };

    wageProgressionRealPctChart: any = {
        title: '',
        type: 'LineChart',
        data: [],
        columns: [
          {name: 'Year', label: 'Year', type: 'string'},
          {name: 'Bottom 20%', label: 'Bottom 20%', type: 'number'},
          {name: 'Second 20%', label: 'Second 20%', type: 'number'},
          {name: 'Middle 20%', label: 'Middle 20%', type: 'number'},
          {name: 'Third 20%', label: 'Third 20%', type: 'number'},
          {name: 'Top 20%', label: 'Top 20%', type: 'number'},
        ],
        options: { 
            'legend': { 'position': 'top' },
            vAxis: { 
                maxValue: 1,
                minValue: -.25,
                viewWindow: {
                    max: 1,
                    min: -.25
                }
            }
        }
    };
    
    allData: WageProgressionChartModel[] = allWageProgressionData as unknown as WageProgressionChartModel[];
    maxYears: number = this.allData.length;

    constructor(private _dataArrayConverter: DataArrayConverterService) { }

    async ngOnInit() {
        let numYearsToDisplay: number = 1;
        this.drawNominalAmountChart(numYearsToDisplay);
        this.drawRealAmountChart(numYearsToDisplay);
        this.drawNominalPercentChart(numYearsToDisplay);
        this.drawRealPercentChart(numYearsToDisplay);

        while (true) {
            this.drawNominalAmountChart(numYearsToDisplay);
            this.drawRealAmountChart(numYearsToDisplay);
            this.drawNominalPercentChart(numYearsToDisplay);
            this.drawRealPercentChart(numYearsToDisplay);
            
            if (numYearsToDisplay < this.maxYears) {
                await new Promise(r => setTimeout(r, 350));
                numYearsToDisplay += 1;
            }
            else {
                await new Promise(r => setTimeout(r, 5000));
                numYearsToDisplay = 1;
            }
        };
    }

    private drawNominalAmountChart(numYearsToDisplay: number) {
        let chartData: WageProgressionChartModel[] = this.allData.slice(0, numYearsToDisplay - 1);
        let visibleColumns: string[] = ['year', 'firstQuintileNominal', 'secondQuintileNominal', 'thirdQuintileNominal','fourthQuintileNominal','fifthQuintileNominal'];
        let dataArray: any[] = this._dataArrayConverter.convert(chartData, visibleColumns);
        this.wageProgressionNominalChart.title = `Nominal Wage Progression by Quintile, Year: ${this.allData[numYearsToDisplay - 1].year}`;
        this.wageProgressionNominalChart.data = Object.assign([], dataArray);
    }

    private drawRealAmountChart(numYearsToDisplay: number) {
        let chartData: WageProgressionChartModel[] = this.allData.slice(0, numYearsToDisplay - 1);
        let visibleColumns: string[] = ['year', 'firstQuintile2020', 'secondQuintile2020', 'thirdQuintile2020','fourthQuintile2020','fifthQuintile2020'];
        let dataArray: any[] = this._dataArrayConverter.convert(chartData, visibleColumns);
        this.wageProgressionRealChart.title = `Wage Progression by Quintile in 2020 Dollars, Year: ${this.allData[numYearsToDisplay - 1].year}`;
        this.wageProgressionRealChart.data = Object.assign([], dataArray);
    }

    private drawNominalPercentChart(numYearsToDisplay: number) {
        let chartData: WageProgressionChartModel[] = this.allData.slice(0, numYearsToDisplay - 1);
        let visibleColumns: string[] = ['year', 'firstQuintileNominalPct', 'secondQuintileNominalPct', 'thirdQuintileNominalPct','fourthQuintileNominalPct','fifthQuintileNominalPct'];
        let dataArray: any[] = this._dataArrayConverter.convert(chartData, visibleColumns);
        this.wageProgressionNominalPctChart.title = `Nominal Wage % Progression by Quintile, Year: ${this.allData[numYearsToDisplay - 1].year}`;
        this.wageProgressionNominalPctChart.data = Object.assign([], dataArray);
    }

    private drawRealPercentChart(numYearsToDisplay: number) {
        let chartData: WageProgressionChartModel[] = this.allData.slice(0, numYearsToDisplay - 1);
        let visibleColumns: string[] = ['year', 'firstQuintile2020Pct', 'secondQuintile2020Pct', 'thirdQuintile2020Pct','fourthQuintile2020Pct','fifthQuintile2020Pct'];
        let dataArray: any[] = this._dataArrayConverter.convert(chartData, visibleColumns);
        this.wageProgressionRealPctChart.title = `Wage Progression % by Quintile in 2020 Dollars, Year: ${this.allData[numYearsToDisplay - 1].year}`;
        this.wageProgressionRealPctChart.data = Object.assign([], dataArray);
    }
}
  