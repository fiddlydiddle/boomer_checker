import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WageProgressionComponent } from './components/wage-progression/wage-progression.component';
import { WageDataComponent } from './components/wage-data/wage-data.component';
import { WorkTimeComponent } from './components/work-time/work-time.component';
import { GoogleChartsModule } from 'angular-google-charts';
import { AngularMaterialModule } from './modules/angular-material.module';
import { WorkTimeChartComponent } from './components/work-time-chart/work-time-chart.component';
import { BoomerCheckerComponent } from './pages/tools/boomer-checker/boomer-checker.page';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LineChartComponent } from './components/d3-charts/line-chart/line-chart.component';
import { LineChartRaceComponent } from './components/d3-charts/line-chart-race/line-chart-race.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    BoomerCheckerComponent,
    WorkTimeComponent,
    WorkTimeChartComponent,
    WageDataComponent,
    WageProgressionComponent,
    LineChartComponent,
    LineChartRaceComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    GoogleChartsModule,
    AngularMaterialModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
