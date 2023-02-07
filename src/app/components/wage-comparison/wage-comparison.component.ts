import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { AnnualDataPoint } from "src/app/datamodels/annual-datapoint.model";
import { TimeFrame } from "src/app/datamodels/timeframe.model";
import { WageComparisonModel } from "src/app/datamodels/wage-comparison.model";
import { DataFormatterService } from "src/app/services/data-formatter.service";


@Component({
    selector: 'wage-comparison',
    templateUrl: 'wage-comparison.component.html',
    styleUrls: ['wage-comparison.component.scss']
})
export class WageComparisonComponent implements OnInit, OnChanges {
    //////////////////////////////
    //        Properties        //
    //////////////////////////////
    @Input() selectedYear!: number;
    @Input() data!: AnnualDataPoint;
    @Input() timeFrame!: TimeFrame;
    @Input() visible!: boolean;
    
    _dataFormatter: DataFormatterService;

    constructor(dataFormatter: DataFormatterService) {
        this._dataFormatter = dataFormatter;
    }

    ngOnInit(): void {

    }

    ngOnChanges() {
    }
}
  