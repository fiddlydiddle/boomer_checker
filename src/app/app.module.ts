import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WageDataComponent } from './components/wage-data/wage-data.component';
import { WorkTimeComponent } from './components/work-time/work-time.component';
import { AngularMaterialModule } from './modules/angular-material.module';
import { WorkTimeChartComponent } from './components/work-time-chart/work-time-chart.component';
import { BoomerCheckerComponent } from './pages/tools/boomer-checker/boomer-checker.page';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LineChartComponent } from './components/d3-charts/line-chart/line-chart.component';
import { LineChartRaceComponent } from './components/d3-charts/line-chart-race/line-chart-race.component';
import { FooterComponent } from './components/footer/footer.component';
import { ModalComponent } from './components/modal/modal.component';
import { FilterPanelComponent } from './components/filter-panel/filter-panel.component';
import { SourcesListComponent } from './components/sources-list/sources-list.component';
import { BudgetBreakdownComponent } from './components/budget-breakdown/budget-breakdown.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    BoomerCheckerComponent,
    WorkTimeComponent,
    WorkTimeChartComponent,
    WageDataComponent,
    LineChartComponent,
    LineChartRaceComponent,
    ModalComponent,
    FilterPanelComponent,
    SourcesListComponent,
    BudgetBreakdownComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    MatCheckboxModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
