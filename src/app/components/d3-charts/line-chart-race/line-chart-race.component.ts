import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';
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
        this.drawAnimatedChart();
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
    private margin = { left: 50, right: 0, top: 10, bottom: 50 };
    private xScale = {} as d3.ScaleTime<number, number, never>;
    private yScale = {} as d3.ScaleLinear<number, number, never>;
    private yAxisUpperBound = 2;
    private duration = 500;
    private iteration = 1;

    constructor() { }

    ngAfterViewInit(): void {
        this.htmlElement = this.element.nativeElement;
        this.host = d3.select(this.htmlElement);
        this.drawStaticChart();
        this.drawAnimatedChart();
    }

    public playAnimation() {
        this.drawStaticChart();
        this.drawAnimatedChart();
    }

    private buildSVG(): void {
        // Intialize chart dimensions
        this.host.selectAll('*').remove();
        this.svg = this.host.append('svg')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
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
        this.xScale = d3.scaleTime()
            .domain(d3.extent(seriesXValues) as [number, number])
            .range([0, this.width]);
        this.yScale = d3.scaleLinear()
            .domain(d3.extent(seriesYValues) as [number, number])
            .range([this.height, 0]);

        // Append axes to svg
        this.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${this.height})`)
            .call(d3.axisBottom(this.xScale));

        this.svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(this.yScale));


        // Add lines
        const lines: any = [];
        this._data.forEach(dataSeries => {
            const path = this.svg.append('path')
                .datum(dataSeries.dataPoints)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 1.5)
                .attr('class', dataSeries.name)
                .attr('d', d3.line()
                    .x((d) => { return this.xScale(((d as unknown) as { year: number }).year); })
                    .y((d) => { return this.yScale(((d as unknown) as { value: number }).value); })
                    .curve(d3.curveCardinal) as any
                );

            lines.push(path);
        });
    }

    private async drawAnimatedChart() {
        if (!this.host.selectAll) return;

        this.buildSVG();

        this.animationInProgress = true;
        this.iteration = 1;
        while (this.iteration < this._data[0].dataPoints.length) {
            this.updateLines();
            this.iteration += 1;
            await new Promise(r => setTimeout(r, this.duration));
        }

        this.animationInProgress = false;
    }

    private updateLines(): void {
        // Create the X axis:
        const startYear = this._data[0].dataPoints[0].year;
        const endYear = this._data[0].dataPoints[this.iteration].year + 5;

        this.xScale.domain([startYear, endYear]);

        // Create the Y axis:
        const maxValueOfEachSeries = this._data.map((series) => {
            const seriesChunk = series.dataPoints.slice(0, this.iteration + 1);
            const seriesValues = seriesChunk.map(dataPoint => dataPoint.value);
            return Math.max(...seriesValues);
        });
        var overallMaxValue = Math.max(...maxValueOfEachSeries, 2);

        if (overallMaxValue > this.yAxisUpperBound) {
            this.yAxisUpperBound = overallMaxValue;
        }

        this.yScale.domain([0, overallMaxValue]).nice();

        this.updateAxes();

        this.makeLines();

        // makeTipCircle(data)

        // makeLabels(data)

    }

    private updateAxes() {
        if (this.iteration === 1) {
            // Append axes to svg
            this.svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0, ${this.height})`)
                .call(d3.axisBottom(this.xScale));

            this.svg.append('g')
                .attr('class', 'y-axis')
                .call(d3.axisLeft(this.yScale));
        }
        else {
            //update x axis
            this.svg.selectAll(".x-axis")
                .transition()
                .ease(d3.easeLinear)
                .duration(this.duration)
                .call(d3.axisBottom(this.xScale) as any);

            // update y axis
            this.svg.selectAll(".y-axis")
                .transition()
                .ease(d3.easeCubic)
                .duration(this.duration)
                .call(d3.axisLeft(this.yScale) as any);
        }

    }

    private makeLines() {
        const chunkedData = this._data.map(series => {
            return {
                name: series.name,
                className: series.className,
                dataPoints: series.dataPoints.slice(0, this.iteration + 1)
            } as LineChartSeries
        });

        if (this.iteration === 1) {
            chunkedData.forEach(dataSeries => {
                this.svg.append('path')
                    .datum(dataSeries.dataPoints)
                    .attr('fill', 'none')
                    .attr('stroke', 'steelblue')
                    .attr('stroke-width', 1.5)
                    .attr('class', dataSeries.className)
                    .attr('d', d3.line()
                        .x((d) => { return this.xScale(((d as unknown) as { year: number }).year); })
                        .y((d) => { return this.yScale(((d as unknown) as { value: number }).value); }) as any
                    );
            });
        }
        else {
            chunkedData.forEach(dataSeries => {
                // generate line paths
                const line = this.svg.selectAll(`.${dataSeries.className}`)
                    .datum(dataSeries.dataPoints)
                    .attr('class', dataSeries.className);

                // transition from previous paths to new paths
                line
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(this.duration)
                    // .attr('fill', 'none')
                    // .attr('stroke', 'steelblue')
                    .attr('stroke-width', 1.5)
                    .attr('d', d3.line()
                        .x((d) => { return this.xScale(((d as unknown) as { year: number }).year); })
                        .y((d) => { return this.yScale(((d as unknown) as { value: number }).value); }) as any
                    )
                // .attr("stroke", (d) => "url(#linear-gradient-" + d.name + ")");

                // enter any new data
                line
                    .enter()
                    .append("path")
                    .attr("class", dataSeries.className)
                    .attr("fill", "none")
                    .attr("clip-path", "url(#clip)")
                    .attr("stroke-width", 1.5)
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(this.duration);

                // .attr("stroke", (d) => "url(#linear-gradient-" + d.name + ")");

                // exit
                // line
                //     .exit()
                //     .transition()
                //     .ease(d3.easeLinear)
                //     .duration(this.duration)
                //     .remove();

            });
        }
    }
}