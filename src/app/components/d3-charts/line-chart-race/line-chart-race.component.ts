import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { LineChartDataPoint } from 'src/app/datamodels/d3-charts/line-chart-data-point.model';
import { LineChartSeries } from 'src/app/datamodels/d3-charts/line-chart-series.model';

@Component({
  selector: 'line-chart-race',
  templateUrl: 'line-chart-race.component.html',
  styleUrls: []
})
export class LineChartRaceComponent implements AfterViewInit {
  private _data: LineChartSeries[] = [];
  @Input() 
        set data(newData: LineChartSeries[]) {
          this._data = newData;
          this.drawStaticChart();
        }
  
  // Public properties
  @ViewChild('d3linechart') element: ElementRef<HTMLInputElement> = {} as ElementRef;
  animationInProgress: boolean = false;

  // Private properties
  private host = {} as d3.Selection<HTMLElement, {}, d3.BaseType, any>;
  private htmlElement = {} as HTMLElement;
  private svg = {} as d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private width: number = 250;
  private height: number = 250;
  private margin = { left: 50, right: 0, top: 10, bottom: 50};
  private xScale = {} as d3.ScaleTime<number, number, never>;
  private xAxis = {} as d3.Axis<Date | d3.NumberValue>;
  private yScale = {} as d3.ScaleLinear<number, number, never>;
  private yAxis = {} as d3.Axis<d3.NumberValue>;
  private yAxisUpperBound = 10;
  private duration = 500;

  constructor() {}

  ngAfterViewInit(): void {
    this.htmlElement = this.element.nativeElement;
    this.host = d3.select(this.htmlElement);
    this.drawStaticChart();
  }

  public playAnimation() {
    this.drawAnimatedChart();
  }

  private buildSVG(): void {
    // Intialize chart dimensions
    this.host.selectAll('*').remove();
    this.svg = this.host.append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this. margin.top})`);
  }

  private drawStaticChart(): void {
    if (!this.host.selectAll) return;

    this.buildSVG();

    // Get all xValues and yValues for calculating the axis sizes
    const seriesXValues: number[] = [];
    this._data.forEach(series => {
      return series.dataPoints.map(dataPoint => {
        seriesXValues.push(dataPoint.year);
      });
    });
    const seriesYValues: number[] = [0];
    this._data.forEach(series => {
      return series.dataPoints.map(dataPoint => {
        seriesYValues.push(dataPoint.value);
      });
    });
    const xScale = d3.scaleTime()
      .domain(d3.extent(seriesXValues) as [number, number])
      .range([0, this.width ]);
    const yScale = d3.scaleLinear()
      .domain(d3.extent(seriesYValues) as [number, number])
      .range([this.height, 0]);

    // Set up chart area
    const area = d3.area()
      .x((d) => { return xScale(d[0]); })
      .y0(this.height)
      .y1((d) => { return yScale(d[1]); })
      .curve(d3.curveCardinal);

    // Append axes to svg
    this.svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${this.height})`)
    .call(d3.axisBottom(xScale));

    this.svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));
    

    // Add lines
    const lines: any = [];
    this._data.forEach(dataSeries => {
      const path = this.svg.append('path')
        .datum(dataSeries.dataPoints)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', d3.line()
          .x((d) => { return xScale(((d as unknown) as { year: number }).year); }) 
          .y((d) => { return yScale(((d as unknown) as { value: number }).value); }) 
          .curve(d3.curveCardinal) as any
        );

      lines.push(path);
    });
  }

  private drawAnimatedChart(): void {
    if (!this.host.selectAll) return;

    this.buildSVG();

    this.animationInProgress = true;
    let iteration = 1;

    if (iteration < this._data.length) {
        setTimeout(() => {
            this.updateLines(iteration);
            iteration += 1;
        }, 250);

    }
    else {
        this.animationInProgress = false;
    }
  }

  private updateLines(iteration: number): void {
    const dataChunk = this._data.slice(0, iteration);

    // Create the X axis:
    const startDate = new Date(dataChunk[0].dataPoints[0].year);
    const endData = new Date(dataChunk[0].dataPoints[dataChunk[0].dataPoints.length - 1].year);

    this.xScale.domain([startDate, endData]);      
    
    // Create the Y axis:
    const maxValueOfEachSeries = dataChunk.map((series) => {
        const seriesValues = series.dataPoints.map(dataPoint => dataPoint.value);
        return Math.max(...seriesValues);
    });
    var overallMaxValue = Math.max(...maxValueOfEachSeries, 10);

    if (overallMaxValue > this.yAxisUpperBound){
        this.yAxisUpperBound = overallMaxValue;
    }

    this.yScale.domain([0, overallMaxValue]).nice();

    this.updateAxes();
                
    this.makeLines(dataChunk);

    // makeTipCircle(data)

    // makeLabels(data)
        

    iteration += 1;
  }

  private updateAxes(){
    //update x axis
    this.svg.selectAll(".x.axis")
        .transition()
        .ease(d3.easeLinear)
        .duration(this.duration)
        .call(this.xAxis as any);

    // update y axis
    this.svg.selectAll(".y.axis")
        .transition()
        .ease(d3.easeCubic)
        .duration(1000)
        .call(this.yAxis as any);
  }

  private makeLines(dataChunk: LineChartSeries[]) {
    // generate line paths
    const lines = this.svg.selectAll(".line")
        .data(dataChunk)
        .attr("class","line");
        
    // transition from previous paths to new paths
    lines
        .transition()
        .ease(d3.easeLinear)
        .duration(this.duration)
        .attr("stroke-width", 5.0)
        .attr("stroke-opacity", 1)
        .attr("d", series => d3.line(...series.dataPoints.map(dataPoint => dataPoint.value)) as any)
        .attr("stroke", (d) =>  "url(#linear-gradient-" + d.name + ")" );

    // enter any new data
    lines
        .enter()
        .append("path")
        .attr("class","line")
        .attr("fill","none")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("clip-path", "url(#clip)")
        .attr("stroke-width", 5.0)
        .attr("stroke-opacity", 1)
        .transition()
        .ease(d3.easeLinear)
        .duration(this.duration)
        .attr("d", series => d3.line(...series.dataPoints.map(dataPoint => dataPoint.value)) as any)
        .attr("stroke", (d) =>  "url(#linear-gradient-"+d.name+")" );
    
    // exit
    lines
        .exit()
        .transition()
        .ease(d3.easeLinear)
        .duration(this.duration)
        .remove();
  }
}