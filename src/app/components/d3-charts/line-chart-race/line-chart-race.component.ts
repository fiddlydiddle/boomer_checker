import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { LineChartSeries } from 'src/app/datamodels/d3-charts/line-chart-series.model';
import { DataFormatterService } from 'src/app/services/data-formatter.service';

@Component({
    selector: 'line-chart-race',
    templateUrl: 'line-chart-race.component.html',
    styleUrls: ['line-chart-race.component.scss']
})
export class LineChartRaceComponent implements AfterViewInit {
    private _title: string = "";
    @Input()
    set title(newTitle: string) {
        this._title = newTitle;
    }

    private _data: LineChartSeries[] = [];
    @Input()
    set data(newData: LineChartSeries[]) {
        this._data = newData;
        this.drawStaticChart();
    }

    private _valueFormat: string = 'number';
    @Input()
    set valueFormat(newFormat: string) {
        this._valueFormat = newFormat;
    }

    // Public properties
    @ViewChild('d3linechart') element: ElementRef<HTMLInputElement> = {} as ElementRef;
    @ViewChild('chartlegend') legendElement: ElementRef<HTMLInputElement> = {} as ElementRef;
    @ViewChild('charttitle') titleElement: ElementRef<HTMLInputElement> = {} as ElementRef;
    animationInProgress: boolean = false;

    // Private properties
    private _dataFormatter: DataFormatterService;
    private host = {} as d3.Selection<HTMLElement, {}, d3.BaseType, any>;
    private htmlElement = {} as HTMLElement;
    private svg = {} as d3.Selection<SVGGElement, {}, d3.BaseType, any>;
    private defaultWidth: number = 250;
    private height: number = 400;
    private margin = { left: 50, right: 0, top: 10, bottom: 50 };
    private xScale = {} as d3.ScaleTime<number, number, never>;
    private yScale = {} as d3.ScaleLinear<number, number, never>;
    private yAxisUpperBound = 2;
    private duration = 500;
    private iteration = 1;
    private chartOptions = {
        colors: ["firebrick", "darkslateblue", "darkorange"],
        legend: {
            itemSize: 10,
            spacing: 150,
            xOffset: 50,
            yOffset: 0
        },
        tipCircles: {
            radius: 8,
            lineWidth: 3,
            labels: {
                xOffset: -125,
                yOffset: 2
            }
        }
    }
    private chartIdentifierGUID = this.newGuid();

    constructor(dataFormatter: DataFormatterService) {
        this._dataFormatter = dataFormatter;
      }

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
        const chartWidth = this.host.node()?.getBoundingClientRect().width || this.defaultWidth;
        this.svg = this.host.append('svg')
            .attr('width', chartWidth - this.margin.left - this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom) as any;
        
        // Create clip path to prevent lines from running off side of chart
        this.svg.append('g')
            .append('clipPath')
            .attr('id', `lineClip${this.chartIdentifierGUID}`)
            .append("rect")
            .attr("width", chartWidth - this.margin.left - this.margin.right - 15)
            .attr("height", this.height) as any;
        
        this.svg = this.svg.append('g')
            .attr('transform', `translate(0, ${this.margin.top})`);

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
        const chartWidth = this.host.node()?.getBoundingClientRect().width || this.defaultWidth;
        this.xScale = d3.scaleTime()
            .domain(d3.extent(seriesXValues) as [number, number])
            .range([this.margin.left, chartWidth - this.margin.left - this.margin.right - 15]);
        this.yScale = d3.scaleLinear()
            .domain(d3.extent(seriesYValues) as [number, number])
            .range([this.height, 20]);

        // Append axes to svg
        this.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${this.height})`)
            .call(d3.axisBottom(this.xScale)
                    .ticks(8)
                    .tickFormat(d3.format('d')) as any);

        this.svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.yScale));


        // Add lines
        const lines: any = [];
        this._data.forEach((dataSeries, index) => {
            const path = this.svg.append('path')
                .datum(dataSeries.dataPoints)
                .attr('fill', 'none')
                .attr('stroke', this.chartOptions.colors[index])
                .attr('stroke-width', 1.5)
                .attr('class', dataSeries.name)
                .attr('d', d3.line()
                    .x((d) => { return this.xScale(((d as unknown) as { year: number }).year); })
                    .y((d) => { return this.yScale(((d as unknown) as { value: number }).value); })
                    .curve(d3.curveCardinal) as any
                );

            lines.push(path);
        });

        this.addTitleAndLegend();
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
        const endYear = this._data[0].dataPoints[this.iteration].year;

        const chartWidth = this.host.node()?.getBoundingClientRect().width || this.defaultWidth;
        this.xScale
            .domain([startYear, endYear])
            .range([this.margin.left, chartWidth - this.margin.left - this.margin.right - 15]);

        // Create the Y axis:
        const maxValueOfEachSeries = this._data.map((series) => {
            const seriesChunk = series.dataPoints.slice(0, this.iteration + 2);
            const seriesValues = seriesChunk.map(dataPoint => dataPoint.value);
            return Math.max(...seriesValues);
        });
        var overallMaxValue = Math.max(...maxValueOfEachSeries, 2);

        if (overallMaxValue > this.yAxisUpperBound) {
            this.yAxisUpperBound = overallMaxValue;
        }

        this.yScale
            .domain([0, overallMaxValue])
            .range([this.height, 20]);

        this.updateAxes();

        this.makeLines();

        this.updateTipCircles();

        this.updateCircleLabels();

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
                .attr('transform', `translate(${this.margin.left}, 0)`)
                .call(d3.axisLeft(this.yScale));
        }
        else {
            //update x axis
            this.svg.selectAll(".x-axis")
                .transition()
                .ease(d3.easeLinear)
                .duration(this.duration)
                .call(d3.axisBottom(this.xScale)
                    .ticks(8)
                    .tickFormat(d3.format('d')) as any);

            // update y axis
            this.svg.selectAll(".y-axis")
                .attr('transform', `translate(${this.margin.left},0)`)
                .transition()
                .ease(d3.easeLinear)
                .duration(this.duration)
                .call(d3.axisLeft(this.yScale) as any);
        }

    }

    private makeLines() {
        if (this.iteration === 1) {
            this._data.forEach((dataSeries, index) => {
                this.svg.append('path')
                    .datum(dataSeries.dataPoints)
                    .attr("clip-path", `url(#lineClip${this.chartIdentifierGUID}`)
                    .attr('fill', 'none')
                    .attr('stroke', this.chartOptions.colors[index])
                    .attr('stroke-width', 1.5)
                    .attr('class', dataSeries.className)
                    .attr('d', d3.line()
                        .x((d) => { return this.xScale(((d as unknown) as { year: number }).year); })
                        .y((d) => { return this.yScale(((d as unknown) as { value: number }).value); }) as any
                    );
            });
        }
        else {
            this._data.forEach(dataSeries => {
                // generate line paths
                const line = this.svg.selectAll(`.${dataSeries.className}`)
                    .datum(dataSeries.dataPoints)
                    .attr('class', dataSeries.className);

                // transition from previous paths to new paths
                line
                    .attr("clip-path", `url(#lineClip${this.chartIdentifierGUID}`)
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(this.duration)
                    .attr('stroke-width', 1.5)
                    .attr('d', d3.line()
                        .x((d) => { return this.xScale(((d as unknown) as { year: number }).year); })
                        .y((d) => { return this.yScale(((d as unknown) as { value: number }).value); }) as any
                    )
            });
        }
    }

    private addTitleAndLegend() {
        const chartWidth = this.host.node()?.getBoundingClientRect().width || this.defaultWidth;

        // Add title to chart
        const titleHtmlElement = this.titleElement.nativeElement;
        d3.select(`#title${this.chartIdentifierGUID}`).remove();
        const title = d3
            .select(titleHtmlElement)
            .append('text')
                .attr('id', `title${this.chartIdentifierGUID}`)
                .attr('class', 'title')
                .style('display', 'block')
                .style('font-weight', 'bold')
                .style('width', '100%')
                .style('text-align', 'center')
                .style('margin-top', '10px')
                .style('margin-bottom', '5px')
                .text(this._title);

        // Add legend to chart
        const legendHtmlElement = this.legendElement.nativeElement;
        d3.select(`#legend${this.chartIdentifierGUID}`).remove();

        const legend = d3
            .select(legendHtmlElement)
            .append('svg')
                .attr('id', `legend${this.chartIdentifierGUID}`)
                .attr('width', chartWidth)
                .attr('height', 20)
                .selectAll('.legendItem')
                .data(this._data);

        //Create legend items
        legend
            .enter()
            .append('rect')
            .attr('class', 'legendItem')
            .attr('width', this.chartOptions.legend.itemSize)
            .attr('height', this.chartOptions.legend.itemSize)
            .style('fill', (dataSeries, index) => this.chartOptions.colors[index])
            .attr('transform', (dataSeries, index) => {
                const x = this.chartOptions.legend.xOffset + (this.chartOptions.legend.itemSize + this.chartOptions.legend.spacing) * index;
                const y = this.chartOptions.legend.yOffset + 5;
                return `translate(${x}, ${y})`;
            });

        //Create legend labels
        legend
            .enter()
            .append('text')
            .attr('transform', (dataSeries, index) => {
                const x = this.chartOptions.legend.xOffset + this.chartOptions.legend.itemSize + 5 + (this.chartOptions.legend.itemSize + this.chartOptions.legend.spacing) * index;
                const y = this.chartOptions.legend.yOffset + this.chartOptions.legend.itemSize + 5;
                return `translate(${x}, ${y})`;
            })
            .text(dataSeries => dataSeries.name);  
    }

    private updateTipCircles() {
        // Generate new circles
        const circles = this.svg.selectAll(".circle").data(this._data);
            
        // Transition from previous circles to new
        circles
            .enter()
            .append("circle")
            .attr("class","circle")
            .attr("fill", "white")
            .attr("stroke", (dataSeries, index) => this.chartOptions.colors[index])
            .attr("stroke-width", this.chartOptions.tipCircles.lineWidth)
            .attr("cx", dataSeries => this.xScale(dataSeries.dataPoints[this.iteration].year))
            .attr("cy", dataSeries => this.yScale(dataSeries.dataPoints[this.iteration].value))
            .attr("r", this.chartOptions.tipCircles.radius)
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration);



        // enter new circles
        circles
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration)
            .attr("cx", dataSeries => this.xScale(dataSeries.dataPoints[this.iteration].year))
            .attr("cy", dataSeries => this.yScale(dataSeries.dataPoints[this.iteration].value))
            .attr("r", this.chartOptions.tipCircles.radius)
            .attr("fill", "white")
            .attr("stroke", (dataSeries, index) => this.chartOptions.colors[index])
            .attr("stroke-width", this.chartOptions.tipCircles.lineWidth);
    }

    private updateCircleLabels() {
        //generate labels
        const labels = this.svg.selectAll(".label").data(this._data);

        //transition from previous labels to new labels
        labels
            .enter()
            .append("text")
            .attr("class","label")
            .attr("font-size","18px")
            .attr("clip-path", "url(#clip)")
            .style("fill", (dataSeries, index) => this.chartOptions.colors[index])
            .transition()
            .ease(d3.easeLinear)
            .attr("x", (dataSeries) => this.xScale(dataSeries.dataPoints[this.iteration].year) + this.chartOptions.tipCircles.labels.xOffset)
            .attr("y", (dataSeries) => this.yScale(dataSeries.dataPoints[this.iteration].value) + this.chartOptions.tipCircles.labels.yOffset)
            .style('text-anchor', 'start')
            .text(dataSeries => {
                let formattedNumber = `${this._dataFormatter.formatNumber(dataSeries.dataPoints[this.iteration].value, 0)}`;
                if (this._valueFormat === 'currency') {
                    formattedNumber = `$${formattedNumber}`;
                }
                return formattedNumber;
            });

        // add new labels
        labels
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration)
            .attr("x", (dataSeries) => this.xScale(dataSeries.dataPoints[this.iteration].year) + this.chartOptions.tipCircles.labels.xOffset)
            .attr("y", (dataSeries) => this.yScale(dataSeries.dataPoints[this.iteration].value) + this.chartOptions.tipCircles.labels.yOffset)
            .attr("font-size","18px")
            .style("fill", (dataSeries, index) => this.chartOptions.colors[index])
            .style('text-anchor', 'start')
            .text(dataSeries => {
                let formattedNumber = `${this._dataFormatter.formatNumber(dataSeries.dataPoints[this.iteration].value, 0)}`;
                if (this._valueFormat === 'currency') {
                    formattedNumber = `$${formattedNumber}`;
                }
                return formattedNumber;
            });
    }

    private newGuid() {
        return ([1e7] as any + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
}