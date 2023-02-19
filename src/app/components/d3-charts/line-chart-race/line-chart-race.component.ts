import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import DataModel from './data.model';
import covidData from '../../../datafiles/covid-19-us-daily..json';

@Component({
    selector: 'line-chart-race',
    templateUrl: 'line-chart-race.component.html',
    styleUrls: []
})
export class LineChartRaceComponent implements AfterViewInit {
    private _data: DataModel[] = [];
    @Input()
    set data(newData: DataModel[]) {
        this._data = newData;
        this.drawChart();
    }

    // Public properties
    @ViewChild('d3linechart') element: ElementRef<HTMLInputElement> = {} as ElementRef;

    // Private properties
    private host: d3.Selection<HTMLElement, {}, d3.BaseType, any> = {} as d3.Selection<HTMLElement, {}, d3.BaseType, any>;
    private htmlElement: HTMLElement = {} as HTMLElement;
    private svg: d3.Selection<SVGGElement, {}, d3.BaseType, any> = {} as d3.Selection<SVGGElement, {}, d3.BaseType, any>;
    private margin = { top: 20, right: 60, bottom: 20, left: 40 };
    private width = 1200 - this.margin.left - this.margin.right;
    private height = 650 - this.margin.top - this.margin.bottom;
    private duration = 1000;
    private caseTypes = [
        { 'id': 'positiveIncrease', "title": "Positive Cases", "color": ["#fff3cc", "#ffc500", "#c21500"], "flag": "coronavirus.png" },
        { 'id': 'totalTestResultsIncrease', "title": "Tests ", "color": ["#A7BFE8", "#0575E6", "#021B79"], "flag": "testing.png" }
    ];
    private final: any[][] = [];
    private yAxisMaxLimit = 0;
    private monthText: d3.Selection<SVGTextElement, {}, d3.BaseType, any> = {} as d3.Selection<SVGTextElement, {}, d3.BaseType, any>;
    private intervalId: ReturnType<typeof setInterval> = {} as ReturnType<typeof setInterval>;
    private monthFormat = d3.timeFormat("%B %Y");
    private iteration = 0;

    constructor() { }

    ngAfterViewInit(): void {
        this.htmlElement = this.element.nativeElement;
        this.host = d3.select(this.htmlElement);
        this.drawChart();
    }

    private drawChart(): void {
        if (!this.host.selectAll) return;

        // main content holder
        this.svg = this.host.append('svg')
            .style("background", "#fff")
            .style("color", "#fff")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom + 100)
            .attr("class", "graph-svg-component")
            .attr("fill", "currentColor")
            .attr("class", "shadow")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .append("g")
            .attr("transform", "translate(" + (this.margin.left + 50) + "," + (this.margin.top + 40) + ")");


        // background grey    
        this.svg.append("rect")
            .attr("x", 0)
            .attr("y", 35)
            .attr("height", this.height - 30)
            .attr("width", this.width - 100)
            .style("fill", "#e5e5e5")
            .style("opacity", 0.01)

        // // add channel logo
        // const myimage = this.svg.append('image')
        //     .attr('xlink:href', 'logo/your_logo_here.png')
        //     .attr('width', 150)
        //     .attr('height', 150)
        //     .attr('opacity', 0.5)
        // myimage.attr('x', this.width - 230)
        // myimage.attr('y', this.height - 30)

        // clip paths
        this.svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 10)
            .attr("y", 35)
            .attr("width", this.width)
            .attr("height", this.height - 30);

        this.svg.append("defs")
            .append("clipPath")
            .attr("id", "yaxisclip")
            .append("rect")
            .attr("x", -90)
            .attr("y", 30)
            .attr("width", this.width)
            .attr("height", this.height);

        this.svg.append("defs")
            .append("clipPath")
            .attr("id", "xaxisclip")
            .append("rect")
            .attr("x", 0)
            .attr("y", -(this.height - 30))
            .attr("width", this.width - 90)
            .attr("height", this.height + 100);

        // title of the chart    
        this.svg.append("text")
            .attr("class", "title")
            .attr("x", (this.margin.left + this.width - this.margin.right) / 2)
            .attr("y", this.margin.top - 40)
            .attr("dy", 10)
            .attr("text-anchor", "middle")
            .style("fill", "black")
            .call(text => text.append("tspan").attr("font-size", "17px").attr("fill-opacity", 0.8).text("← \xa0"))
            .call(text => text.append("tspan").attr("font-size", "21px").attr("font-weight", "bold").text("\xa0USA Covid-19\xa0"))
            .call(text => text.append("tspan").attr("font-size", "21px").attr("fill", "#021B79").attr("font-weight", "bold").text("\xa0Tests\xa0"))
            .call(text => text.append("tspan").attr("font-size", "21px").attr("font-weight", "bold").text("\xa0 vs \xa0"))
            .call(text => text.append("tspan").attr("font-size", "21px").attr("fill", "#c21500").attr("font-weight", "bold").text("\xa0Positive cases\xa0"))
            .call(text => text.append("tspan").attr("font-size", "17px").attr("fill-opacity", 0.8).text("\xa0 →"));


        // time format    
        const color = d3.scaleOrdinal(d3.schemeTableau10);

        // import json data
        const data = covidData;
        const typedData = data as unknown as DataModel[];

        color.domain(Object.keys(typedData[0]).filter(function (key) {
            return key !== "date";
        }));

        // extract column names
        const columns = Object.keys(typedData[0]).filter(function (key) {
            return key !== "date";
        });

        // create chunked data
        this.final = this.createChunk(typedData, 14);

        // format dataset to be input in the line creation function
        this.final = this.final.map(dataPoints => {
            const counts = columns.map(column => {
                return {
                    name: column,
                    values: dataPoints.map(dataPoint => {
                        return {
                            date: new Date(dataPoint.date),
                            cases: !isNaN(dataPoint[column]) ? + dataPoint[column] : 0
                        };
                    })
                };
            });

            return counts;
        });

        // create color gradients
        columns.forEach(column => {
            //add gradient
            const linearGradient = this.svg.append("defs")
                .append("linearGradient")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("id", "linear-gradient-" + this.caseTypes.find(caseType => { return caseType.id === column; })?.id);

            linearGradient.append("stop")
                .attr("offset", "5%")
                .attr("stop-color", this.caseTypes.find(caseType => { return caseType.id === column; })?.color[0] as any);

            linearGradient.append("stop")
                .attr("offset", "15%")
                .attr("stop-color", this.caseTypes.find(caseType => { return caseType.id === column; })?.color[1] as any);

            linearGradient.append("stop")
                .attr("offset", "35%")
                .attr("stop-color", this.caseTypes.find(caseType => { return caseType.id === column; })?.color[2] as any);

        });

        // Initialise a X axis:
        const xScale = d3.scaleTime()
            .range([0, this.width - 100]);
        const xAxis = d3.axisBottom(xScale)
            .ticks(d3.timeWeek.every(1))
            .tickFormat(function (d) {
                return "Week" + "-" + d3.timeFormat("%W")(d as Date) + " | " + d3.timeFormat("%d %B")(d as Date)
            })
            .tickSizeInner(-this.height)
            .tickPadding(10);

        // Initialize an Y axis
        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([this.height, 2 * this.margin.top]);

        // initialize the line :
        this.svg.append("g")
            .attr("transform", `translate(10,${this.height})`)
            .attr("class", "x axis")
            .attr("clip-path", "url(#xaxisclip)")
            .call(xAxis);

        this.svg.append("g")
            .attr("transform", `translate(10,0)`)
            .attr("class", "y axis")
            .attr("clip-path", "url(#yaxisclip)");


        const t = this.final[0][0].values;
        const month = this.monthFormat(t[t.length - 1].date);

        this.monthText = this.svg.append("text")
            .attr("x", (this.width) / 2 - 50)
            .attr("y", this.height + 50)
            .attr("dy", 10)
            .attr("text-anchor", "middle")
            .style("fill", "black")
            .attr("font-weight", "bold")
            .attr("fill-opacity", 0.0)
            .attr("font-size", "16px")
            .text("← \xa0 " + month + " \xa0 →");

        if (this.final[this.final.length - 1][0].values.length < 14) {
            this.final = this.final.slice(0, this.final.length - 13)
        }

        // Update the chart
        this.intervalId = setInterval(
            () => { 
                this.update(typedData, xScale, yScale); 
            }, 
            this.duration
        );
    };

    private createChunk(data: any[], chunkSize: number) {
        const chunk = [];
        for (let i = 0; i < data.length; i += 1) {
            chunk.push(data.slice(i, i + chunkSize));
        }
        return chunk;
    }

    private makeLine(data: DataModel[]) {

        // generate line paths
        const lines = this.svg.selectAll(".line").data(data).attr("class", "line");
        // transition from previous paths to new paths
        lines
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration)
            .attr("stroke-width", 5.0)
            .attr("stroke-opacity", function (lineDataPoint: any) {
                if (lineDataPoint.values[lineDataPoint.values.length - 1].cases > 0) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .attr("d", d => d3.line((d as any).values) as any)
            .attr("stroke", (d) => "url(#linear-gradient-" + (d as any).name + ")");

        // enter any new data
        lines
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("clip-path", "url(#clip)")
            .attr("stroke-width", 5.0)
            .attr("stroke-opacity", function (lineDataPoint: any) {
                if (lineDataPoint.values[lineDataPoint.values.length - 1].cases > 0) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration)
            .attr("d", (d: any) => d3.line(d.values) as any)
            .attr("stroke", (d: any) => "url(#linear-gradient-" + d.name + ")");

        // exit
        lines
            .exit()
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration)
            .remove();
    }

    private updateAxis(xAxis: any, yAxis: any) {
        //update x axis
        this.svg.selectAll(".x.axis")
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration)
            .call(xAxis);


        // update y axis
        this.svg.selectAll(".y.axis")
            .transition()
            .ease(d3.easeCubic)
            .duration(1000)
            .call(yAxis);
    }

    private makeTipCircle(data: any, xAxis: any, yAxis: any) {
        // add circle. generetare new circles
        let circles = this.svg.selectAll(".circle").data(data);

        //transition from previous circles to new
        circles
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("fill", "white")
            .attr("clip-path", "url(#clip)")
            .attr("stroke", "black")
            .attr("stroke-width", 7.0)
            .attr("opacity", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .attr("stroke-opacity", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .attr("cx", (d: any) => xAxis(d.values[d.values.length - 1].date))
            .attr("cy", function (d: any) {

                if (d.values[d.values.length - 1].cases > 0) {
                    return yAxis(d.values[d.values.length - 1].cases);
                } else {
                    return yAxis(-2);
                }
            })
            .attr("r", 17)
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration);



        //enter new circles
        circles
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration)
            .attr("cx", (d: any) => xAxis(d.values[d.values.length - 1].date))
            .attr("cy", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return yAxis(d.values[d.values.length - 1].cases);
                } else {
                    return yAxis(-2);
                }
            })
            .attr("r", 17)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 7.0)
            .attr("opacity", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .attr("stroke-opacity", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return 1;
                } else {
                    return 0;
                }
            });


        //remove and exit
        circles
            .exit()
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration)
            .attr("cx", (d: any) => xAxis(d.values[d.values.length - 1].date))
            .attr("cy", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return yAxis(d.values[d.values.length - 1].cases);
                } else {
                    return yAxis(-2);
                }
            })
            .attr("r", 17)
            .remove();
    }

    private makeLabels(data: any, xAxis: any, yAxis: any) {
        //generate name labels
        const names = this.svg.selectAll(".lineLable").data(data);

        //transition from previous name labels to new name labels
        names
            .enter()
            .append("text")
            .attr("class", "lineLable")
            .attr("font-size", "21px")
            .attr("clip-path", "url(#clip)")
            .style("fill", (d: any) => this.caseTypes.find(caseType => { return caseType.id === d.name; })?.color[2] as any)
            .attr("opacity", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .transition()
            .ease(d3.easeLinear)
            .attr("x", function (d: any) {
                return xAxis(d.values[d.values.length - 1].date) + 30;
            })
            .style('text-anchor', 'start')
            .text((d: any) => this.caseTypes.find(caseType => { return caseType.id === d.name; })?.title as any)
            .attr("y", function (d: any) {

                if (d.values[d.values.length - 1].cases > 0) {
                    return yAxis(d.values[d.values.length - 1].cases) - 5;
                } else {
                    return yAxis(-2);
                }
            });

        // add new name labels
        names
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration)
            .attr("x", function (d: any) {
                return xAxis(d.values[d.values.length - 1].date) + 30;
            })
            .attr("y", function (d: any) {

                if (d.values[d.values.length - 1].cases > 0) {
                    return yAxis(d.values[d.values.length - 1].cases) - 5;
                } else {
                    return yAxis(-2);
                }

            })
            .attr("opacity", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .attr("font-size", "21px")
            .style("fill", (d: any) => this.caseTypes.find(caseType => { return caseType.id === d.name; })?.color[2] as any)
            .style('text-anchor', 'start')
            .text((d: any) => this.caseTypes.find(caseType => { return caseType.id === d.name; })?.title as any);


        // exit name labels
        names.exit()
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration)
            .style('text-anchor', 'start')
            .remove();



        //generate labels
        const labels = this.svg.selectAll(".label").data(data);

        //transition from previous labels to new labels
        labels
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("font-size", "18px")
            .attr("clip-path", "url(#clip)")
            .style("fill", (d: any) => this.caseTypes.find(caseType => { return caseType.id === d.name; })?.color[2] as any)
            .attr("opacity", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .transition()
            .ease(d3.easeLinear)
            .attr("x", function (d: any) {
                return xAxis(d.values[d.values.length - 1].date) + 30;
            })
            .style('text-anchor', 'start')
            .text((d: any) => d3.format(',.0f')(d.values[d.values.length - 1].cases))
            .attr("y", function (d: any) {

                if (d.values[d.values.length - 1].cases > 0) {
                    return yAxis(d.values[d.values.length - 1].cases) + 15;
                } else {
                    return yAxis(-2);
                }
            });


        // add new labels
        labels
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration)
            .attr("x", function (d: any) {
                return xAxis(d.values[d.values.length - 1].date) + 30;
            })
            .attr("y", function (d: any) {

                if (d.values[d.values.length - 1].cases > 0) {
                    return yAxis(d.values[d.values.length - 1].cases) + 15;
                } else {
                    return yAxis(-2)
                }

            })
            .attr("opacity", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .attr("font-size", "18px")
            .style("fill", (d: any) => this.caseTypes.find(caseType => { return caseType.id === d.name; })?.color[2] as any)
            .style('text-anchor', 'start');
            // .tween("text", function (d: any) {
            //     if (d.values[d.values.length - 1].cases !== 0) {
            //         let i = d3.interpolateRound(d.values[d.values.length - 2].cases, d.values[d.values.length - 1].cases);
            //         return function (t) {
            //             this.textContent = d3.format(',')(i(t));
            //         };
            //     }
            //     return function() {};
            // });


        // exit labels
        labels.exit()
            .transition()
            .ease(d3.easeCubic)
            .duration(this.duration)
            .style('text-anchor', 'start')
            .remove();

    }

    makeImages(data: any, xAxis: any, yAxis: any) {
        //select all images
        const images = this.svg.selectAll(".image").data(data)

        images
            .enter()
            .append("image")
            .attr("class", "image")
            .attr("clip-path", "url(#clip)")
            // .attr('xlink:href', (d: any) => "continents/" + this.caseTypes.find(caseType => { return caseType.id === d.name; })?.flag as any)
            .attr("width", 40)
            .attr("height", 40)
            .attr("opacity", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .attr("y", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return yAxis(d.values[d.values.length - 1].cases) - 20;
                } else {
                    return yAxis(-2) - 15;
                }

            })
            .attr("x", function (d: any) { return xAxis(d.values[d.values.length - 1].date) - 20; })
            .attr("preserveAspectRatio", "none")
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration);

        //enter new circles
        images
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration)
            // .attr('xlink:href', (d: any) => "continents/" + this.caseTypes.find(caseType => { return caseType.id === d.name; })?.flag)
            .attr("width", 40)
            .attr("height", 40)
            .attr("opacity", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return 1;
                } else {
                    return 0;
                }
            })
            .attr("x", (d: any) => xAxis(d.values[d.values.length - 1].date) - 20)
            .attr("y", function (d: any) {
                if (d.values[d.values.length - 1].cases > 0) {
                    return yAxis(d.values[d.values.length - 1].cases) - 20;
                } else {
                    return yAxis(-2) - 15;
                }
            })
            .attr("preserveAspectRatio", "none");

        //remove and exit
        images.exit()
            .transition()
            .ease(d3.easeLinear)
            .duration(this.duration)
            .remove();
    }

    private update(data: any, xAxis: any, yAxis: any) {
        if (this.iteration < this.final.length) {

            data = this.final[this.iteration];

            // Create the X axis:
            const param = data[0].values,
                date_start = new Date(param[0].date);
            let date_end = new Date(param[param.length - 1].date);
            date_end = new Date(new Date(date_end).setDate(new Date(date_end).getDate() + 6));

            xAxis.domain([date_start, date_end]);

            // Create the Y axis:
            const max_cases_value_of_each_country = data.map((o: any) => Math.max(...o.values.map((v: any) => v.cases)))
            let maxOfValue = Math.max(...max_cases_value_of_each_country.map((o: any) => o));
            if (maxOfValue < 10) {
                maxOfValue = 10
            }

            if (maxOfValue > this.yAxisMaxLimit) {
                this.yAxisMaxLimit = maxOfValue;
            }

            yAxis.domain([0, maxOfValue]).nice();

            this.updateAxis(xAxis, yAxis);

            this.makeLine(data);

            this.makeTipCircle(data, xAxis, yAxis);

            this.makeImages(data, xAxis, yAxis);

            this.makeLabels(data, xAxis, yAxis);

            const month = this.monthFormat(data[0].values[data[0].values.length - 1].date)
            this.monthText
                .transition()
                .ease(d3.easeCubic)
                .duration(2500)
                .attr("fill-opacity", 0.7)
                .text("← \xa0 " + month + " \xa0 →");

            this.iteration = this.iteration + 1;

        } else {
            // clear inetrval at the end
            clearInterval(this.intervalId);
        }
    }
}