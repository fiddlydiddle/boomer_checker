import { Component, NgModule, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { AnnualDataPoint } from 'src/app/datamodels/annual-datapoint.model';
import { ValueInflationPoint } from 'src/app/datamodels/value-inflation.model';
import { PurchaseType } from 'src/app/datamodels/purchase-type.model';
import { TimeFrame } from 'src/app/datamodels/timeframe.model';
import { DataArrayConverterService } from 'src/app/services/data-array-converter.service';
import annualData from '../../../datafiles/annual-data.json';
import { WageChartService } from 'src/app/services/wage-chart.service';
import { DataFormatterService } from 'src/app/services/data-formatter.service';
import { LineChartDataPoint } from 'src/app/datamodels/d3-charts/line-chart-data-point.model';
import { LineChartSeries } from 'src/app/datamodels/d3-charts/line-chart-series.model';


@Component({
  selector: 'boomer-checker',
  templateUrl: 'boomer-checker.page.html',
  styleUrls: ['boomer-checker.page.scss']
})

export class BoomerCheckerComponent implements OnInit {
  @ViewChild('wageComparison', {static: false}) wageComparison: any;
  @ViewChild('workTime', {static: false}) workTime: any;
  
  title = 'Boomer Checker';
  _dataArrayConverter: DataArrayConverterService;
  _wageChartService: WageChartService;
  _dataFormatter: DataFormatterService;

  //////////////////////////////
  //        Properties        //
  //////////////////////////////
  
  // Constants
  minYear: number = 1980;
  maxYear: number = 2020;
  allowedYears: number[] = this.getYears();
  currentYear: number = this.allowedYears[this.allowedYears.length - 1];
  allAnnualData: AnnualDataPoint[] = annualData as unknown as AnnualDataPoint[];
  timeFrames: TimeFrame[] = [
    { name: 'Hours', altName: 'Hourly', hourlyFactor: .0004807692308, annualFactor: 1 },
    { name: 'Weeks', altName: 'Weekly', hourlyFactor: .025, annualFactor: 40 },
    { name: 'Years', altName: 'Annual', hourlyFactor: 1, annualFactor: 2080 },
  ];
  purchaseTypes: PurchaseType[] = [
    { name: 'Year\'s University Tuition', altName: 'University Tuition', key: 'averageUniversityTuition', defaultTimeFrame: this.timeFrames[2] },
    { name: 'House', altName: 'Home Prices', key: 'medianHomePrice', defaultTimeFrame: this.timeFrames[2] },
    { name: 'Month\'s Rent', altName: 'Rent', key: 'medianRent', defaultTimeFrame: this.timeFrames[1] },
    { name: 'Year\'s Healthcare', altName: 'Healthcare', key: 'averageHealthcareCost', defaultTimeFrame: this.timeFrames[0] },
    { name: 'Gallon of Gas', altName: 'Gasoline', key: 'averageGasPrice', defaultTimeFrame: this.timeFrames[0] },
    { name: 'Movie Ticket', altName: 'Seeing Movies', key: 'averageMovieTicketPrice', defaultTimeFrame: this.timeFrames[0] },
  ];
  wageBrackets: string[] = [
    'Minimum Wage',
    'Median Wage',
    'Top 5% Wage',
  ];

  // Inputed and calculated values
  _startingYear: number = 1980;
  get startingYear() { return this._startingYear; }
  set startingYear(value: number) {
    this._startingYear = value;
    this.getPrices();
    this.drawCharts();
  }

  _selectedPurchaseType: PurchaseType = this.purchaseTypes[0]; // Home Purchase
  get selectedPurchaseType() { return this._selectedPurchaseType; }
  set selectedPurchaseType(value: PurchaseType) {
    this._selectedPurchaseType = value;
    this.getPrices();
    this.drawCharts();
  }

  _selectedTimeFrame: TimeFrame = this.timeFrames[0]; // Hourly
  get selectedTimeFrame() { return this._selectedTimeFrame; }
  set selectedTimeFrame(value: TimeFrame) {
    this._selectedTimeFrame = value;
    this.getPrices();
  }

  _selectedWageBracket: string = this.wageBrackets[0]; // Hourly
  get selectedWageBracket() { return this._selectedWageBracket; }
  set selectedWageBracket(value: string) {
    this._selectedWageBracket = value;
    this.getPrices();
  }

  _purchaseStartingPrice: number = 0;
  get purchaseStartingPrice() { return this._purchaseStartingPrice; }

  _purchaseInflationAdjustedPrice: number = 0;
  get purchaseInflationAdjustedPrice() { return this._purchaseInflationAdjustedPrice; }

  _purchaseCurrentPrice: number = 0;
  get purchaseCurrentPrice() { return this._purchaseCurrentPrice; }

  currentAnnualData: AnnualDataPoint = { year: 0, cpiValue: 0, minWage: 0, medianWage3rdQuintile: 0, medianWageTop5Pct: 0, medianHomePrice: 0, medianRent: 0,
                                          averageUniversityTuition: 0, averageGasPrice: 0, averageMovieTicketPrice: 0, averageHealthcareCost: 0 };
  startingAnnualData: AnnualDataPoint = { year: 0, cpiValue: 0, minWage: 0, medianWage3rdQuintile: 0, medianWageTop5Pct: 0, medianHomePrice: 0, medianRent: 0,
                                          averageUniversityTuition: 0, averageGasPrice: 0, averageMovieTicketPrice: 0, averageHealthcareCost: 0 };
                            
  priceInflationDataSeries: LineChartSeries[] = [];

  ////////////////
  // Charts
  ////////////////
  priceInflationChart: any = {
    title: 'Price vs Inflation over Time',
    type: 'LineChart',
    data: [],
    columns: [
      {name: 'Year', label: 'Year', type: 'string'},
      {name: 'Actual Price', label: 'Actual Price', type: 'number'},
      {name: 'Original Price Inflation Adjusted', label: 'Original Price Inflation Adjusted', type: 'number'}
    ],
    options: { 'legend': { 'position': 'top' } }
  };

  wageDataChart: any = {
    title: '',
    type: 'LineChart',
    data: [],
    columns: [
      {name: 'Year', label: 'Year', type: 'string'},
      {name: 'Wage', label: 'Minimum Wage', type: 'number'},
      {name: 'Inflation Adjusted Minimum Wage', label: 'Inflation Adjusted Minimum Wage', type: 'number'}
    ],
    options: { 'legend': { 'position': 'top' } }
  };

  constructor(dataArrayConverter: DataArrayConverterService, wageChartService: WageChartService, dataFormatter: DataFormatterService) {
    this._dataArrayConverter = dataArrayConverter;
    this._wageChartService = wageChartService;
    if (this.allAnnualData && this.allAnnualData.length > 0) {
      this.currentAnnualData = this.allAnnualData[this.allAnnualData.length - 1];
    }
    this._dataFormatter = dataFormatter;
  }

  ngOnInit(): void {
    this.getPrices();
    this.drawCharts();
  }

  public headerActionItemClicked(event:Event) {
    event.stopPropagation();
  }

  private getPrices() {
    this.startingAnnualData = this.allAnnualData.find((annualRecord) => {
      return annualRecord.year == this._startingYear;
    }) ?? this.currentAnnualData;
    this._purchaseStartingPrice = this.startingAnnualData[this._selectedPurchaseType.key];
    this._purchaseCurrentPrice = this.currentAnnualData[this._selectedPurchaseType.key];
    this._purchaseInflationAdjustedPrice = this.calcInflationAdjustedValue(this._purchaseStartingPrice);
  }

  private calcInflationAdjustedValue(startValue: number): number {
    let inflationAdjustedValue: number = 0;
    // Check for inputted starting year in range
    if (this._startingYear < this.minYear || this._startingYear > this.maxYear)
      return inflationAdjustedValue;

    // Run Calculation. Value is (currentCpi / startingCpi) * startingPrice
    if (this.startingAnnualData.cpiValue > 0 ) {
      inflationAdjustedValue = (this.currentAnnualData.cpiValue / this.startingAnnualData.cpiValue) * startValue;
    }

    return inflationAdjustedValue;
  };

  private getYears(): number[] {
    let years: number[] = [];
    let startYear = this.minYear;
    while (startYear <= this.maxYear) {
        years.push(startYear++);
    }   
    return years;
  }

  private drawCharts(): void {
    this.drawPriceChart();
    this.drawWageDataChart();
  }

  private drawPriceChart(): void {
    let priceData: ValueInflationPoint[] = this._wageChartService.getWageData(this.allAnnualData, this._startingYear, this._selectedPurchaseType.key );
    let visibleColumns: string[] = ['year', 'dollarValue', 'inflationAdjustedDollarValue']
    let dataArray: any[] = this._dataArrayConverter.convert(priceData, visibleColumns);
    this.priceInflationChart.data = Object.assign([], dataArray);
    this.priceInflationDataSeries = [];
    this.priceInflationDataSeries.push({
      name: 'Actual Value',
      dataPoints: priceData.map(dataPoint => {
        return { year: dataPoint.year, value: dataPoint.dollarValue };
      })
    });
    this.priceInflationDataSeries.push({
      name: 'Inflation Adjusted Value',
      dataPoints: priceData.map(dataPoint => {
        return { year: dataPoint.year, value: dataPoint.inflationAdjustedDollarValue };
      })
    });
  }

  private drawWageDataChart(): void {
    let priceData: ValueInflationPoint[] = this._wageChartService.getWageData(this.allAnnualData, this._startingYear, 'minWage' );
    let visibleColumns: string[] = ['year', 'dollarValue', 'inflationAdjustedDollarValue']
    let dataArray: any[] = this._dataArrayConverter.convert(priceData, visibleColumns);
    this.wageDataChart.data = Object.assign([], dataArray);
  }
}
