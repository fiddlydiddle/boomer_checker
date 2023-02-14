import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { LineChartDataPoint } from 'src/app/datamodels/d3-charts/line-chart-data-point.model';

@Component({
  selector: 'line-chart',
  templateUrl: 'line-chart.component.html',
  styleUrls: []
})
export class LineChartComponent implements AfterViewInit {
  private _data: LineChartDataPoint[][] = [];
  @Input() 
        // get data() {
        //     return this._data;
        // }
        set data(newData: LineChartDataPoint[][]) {
          this._data = newData;
          this.drawChart(false);
        }
  
  // Public properties
  @ViewChild('d3linechart') element: ElementRef<HTMLInputElement> = {} as ElementRef;
  animationInProgress: boolean = false;

  // Private properties
  private host: d3.Selection<HTMLElement, {}, d3.BaseType, any> = {} as d3.Selection<HTMLElement, {}, d3.BaseType, any>;
  private svg: d3.Selection<SVGGElement, {}, d3.BaseType, any> = {} as d3.Selection<SVGGElement, {}, d3.BaseType, any>;
  private width: number = 250;
  private height: number = 250;
  private margin = { left: 50, right: 0, top: 10, bottom: 50};
  private htmlElement: HTMLElement = {} as HTMLElement;

  constructor() {}

  ngAfterViewInit(): void {
    this.htmlElement = this.element.nativeElement;
    this.host = d3.select(this.htmlElement);
    this.drawChart(false);
  }

  public playAnimation() {
    this.drawChart(true);
  }

  private buildSVG(): void {
    // Intialize chart dimensions
    this.host.html('');
    this.svg = this.host.append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this. margin.top})`);
    
    
  }

  private drawChart(shouldBeAnimated: boolean): void {
    this.animationInProgress = true;

    this.buildSVG();

    // Get all xValues and yValues for calculating the axis sizes
    const seriesXValues: number[] = [];
    this._data.forEach(series => {
      return series.map(dataPoint => {
        seriesXValues.push(dataPoint.year);
      });
    });
    const seriesYValues: number[] = [0];
    this._data.forEach(series => {
      return series.map(dataPoint => {
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
        .datum(dataSeries)
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

    if (shouldBeAnimated) {
      let maxPathLength = 0;
      for (let i = 0; i < lines.length; i++) {
        const pathLength = lines[i].node()?.getTotalLength();
        if (pathLength > maxPathLength) {
          maxPathLength = pathLength;
        }
      }
  
      for (let i = 0; i < lines.length; i++) {
        const pathLength = lines[i].node()?.getTotalLength();
        const transitionPath = d3
          .transition()
          .ease(d3.easeSin)
          .duration(5000);
  
        lines[i].attr('stroke-dashoffset', pathLength)
          .attr('stroke-dasharray', pathLength)
          .transition(transitionPath)
          .attr('stroke-dashoffset', 0)
          .on('end', () => { this.animationInProgress = false; });
      }
    }
    else {
      this.animationInProgress = false;
    }
  }
}