import { CustomCSS } from '../../../ng-material-components/modules/forms/text-area/autosize';
import { isNumber } from 'lodash';

const Highcharts = require('highcharts/js/highcharts');
import { groupBy, includes } from 'lodash';
import { CustomFormat } from '../../../charts/shared/ui/chart-format-info/tooltip-custom-formats';

const comparison = ['previousPeriod', 'twoYearsAgo', 'threeYearsAgo'];

interface Itypography {
    enable: boolean;
    black: boolean;
    cursive: boolean;
    under: boolean;
    size: string;
    color: string;
}
// interface ICustomFormatter {
//     altas_definition_id: string;
//     serie: boolean;
//     serieStyle: string;
//     xEnable: boolean;
//     xStyle: string;
//     total: boolean;
//     totalStyle: string;
//     yStyle: string;
//     valueDecimals: number;
//     suffix: string;
//     prefix: string;
//     shared: boolean;
// }
interface ICustomFormat {
    enableCustom: boolean;
    xValue: Itypography;
    serieValue: Itypography;
    totalValue: Itypography;
    yValueColor: string;

    decimals: number;
    altas_definition_id: string;

    shared: boolean;
    crosshairs: boolean;

    suffix: string;
    prefix: string;
}

export interface ICalculateComparisonDifference {
    difference: number;
    percentageDifference: number;
}

function calculateComparisonDifference(points): ICalculateComparisonDifference {
    let keyTotal = 0;
    let comparisonPoints: any = [];

    // group by series.userOptions.stack
    // i.e. series.userOptions.stack: 'lastYear'
    comparisonPoints = groupBy(points, 'series.userOptions.stack');

    // get the keys of object comparisonPoints
    Object.keys(comparisonPoints).forEach(key => {

        comparisonPoints[key].forEach(val => {
            // tally up the values
            const isTarget: boolean = val.point.series.userOptions.type === 'spline';

            if (!isTarget) {
                keyTotal += val.y;
            }
        });
        // assign each object key the total
        // i.e. [lastYear]: 5000
        comparisonPoints[key] = keyTotal;
        // reset the value for the next property
        keyTotal = 0;
    });

    // convert single array of object to an object
    comparisonPoints = Array.isArray(comparisonPoints) ? Object.assign.apply(Object, comparisonPoints) : comparisonPoints;
    // i.e. previousPeriod, lastYear
    let otherKey;
    const comparisonPointsKeys = Object.keys(comparisonPoints);

    // object would contain 2 properties: 'main' and '(i.e. lastYear, previousPeriod)'
    Object.keys(comparisonPoints).forEach(v => {
        if (v !== 'main') {
            otherKey = v;
        }
    });

    comparisonPoints.main = comparisonPoints.main || 0;
    let percentageDifference: number;
    let difference: number;

    if (comparisonPointsKeys.indexOf('main') === -1) {
        percentageDifference = 100;
        difference = comparisonPoints[otherKey];
    } else {
        percentageDifference = ((comparisonPoints.main - comparisonPoints[otherKey]) / comparisonPoints[otherKey]) * 100;
        difference = comparisonPoints.main - comparisonPoints[otherKey];
    }

    return {
        percentageDifference: percentageDifference,
        difference: difference
    };
}

function trim_tooltip_label_formatter() {
    this.exec = function () {
        let tooltip_html = `<b>${this.x}</b>`;
        tooltip_html += '<div flex>';
        this.points.forEach(p => {
            let serieName = p.series.name;
            if (serieName.length > 10) {
                serieName = `${serieName.substring(0, 12)}... `;
            }
            tooltip_html += `<div layout="row">`;
            tooltip_html += `<div flex style="font-weight:bold; color: ${p.color}">${serieName}: </div>`;
            tooltip_html += `<div flex-initial style="text-align: right">${p.y} USD</div>`;
            tooltip_html += `</div>`;
        });
        tooltip_html += '</div>';
        return tooltip_html;
    };
}

function percentage_target_default_formatter() {
    this.exec = function() {
        let tooltip_html = ``;
        tooltip_html += `<span style="color: ${this.color}">\u25CF</span> ${this.series.name} <b class="highcharts-strong">${Highcharts.numberFormat(this.y, 2)}</b>`;
        if (this.series.userOptions.percentageCompletion) {
            tooltip_html += `</br><span style="color: ${this.color}">\u25CF</span>`;
            tooltip_html += ` target progress: <b class="highcharts-strong">${Highcharts.numberFormat(this.series.userOptions.percentageCompletion, 0)}%</b></span>`;
        }

        return tooltip_html;
    };
}

function dollarize() {
    this.exec = function () {
        return '$' + (<any>this).axis.defaultLabelFormatter.call(this);
    };
}

function percent_pie_chart_formatter() {
    this.exec = function () {
        return Highcharts.numberFormat(this.percentage) + ' %';
    };
}

function tooltip_total(stack?: string, sorting?: string) {
    const that = this;
    this.exec = function () {
        let tooltip_html = ``;
        let total = 0;
        let targetTotal = 0;
        let calculateComparison;
        let nonTargetPointCount = 0;
        let points;
        let totalStacks = new Set();

        this.points.forEach(p => {
            if(p.series.userOptions.hasOwnProperty('stack'))
                totalStacks.add(p.series.userOptions.stack);          
        });

        if (!stack) {
            stack = this.points[0].series.userOptions.hasOwnProperty('stack') ? this.points[0].series.userOptions.stack : '';
        }

        if (totalStacks.size == 1 || (totalStacks.size == 2 && totalStacks.has("main"))) {
            calculateComparison = calculateComparisonDifference(this.points);
        }
        //- beatriz code begins
        //- to show the values in the tooltip sorted low to high 
        if(sorting === 'low_high') {
            points = this.points.sort(function(a, b){
            return ((a.y < b.y) ? -1 : ((a.y > b.y) ? 1 : 0));
        });
         }
         //- to show the values in the tooltip sorted high to low 
         else if(sorting === 'high_low'){
            points = this.points.sort(function(a, b){
            return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
            })
        }
        // no sorting 
         else{
             points = this.points;
         } 

         //- end beatriz code

        points.forEach((p, i) => {
            if (p.series.userOptions.type === 'spline') {
                targetTotal += p.y;
                tooltip_html += `
                    <div flex layout="row">
                        <div flex style="font-weight:bold; color: ${p.color}">${p.series.name}: </div>
                        <div flex-initial style="color: ${p.color}">
                            <span style="font-weight: bold">${Highcharts.numberFormat(p.y)}</span>
                        </div>
                    </div>
                `;

                if (isNumber(p.series.userOptions.percentageCompletion)) {
                    tooltip_html += `
                        <div flex layout="row">
                            <div flex style="color: ${p.series.color}">${p.series.name} (target progress): </div>
                            <div flex-initial style="color: ${p.series.color}">
                                <span style="font-weight: bold">
                                ${Highcharts.numberFormat(p.series.userOptions.percentageCompletion, 0)}%</span>
                            </div>
                        </div>
                    `;
                }
                tooltip_html += `<div flex layout="row" class="p-b-5"></div>`;
            }
        });

        points.forEach((p, i) => {
            if (p.series.userOptions.type !== 'spline') {
                total += p.y;
                nonTargetPointCount = nonTargetPointCount + 1;
                tooltip_html += `
                    <div flex layout="row">
                        <div flex style=" color: ${p.color}">${p.series.name}: </div>
                        <div flex-initial>
                            <span style="font-weight: bold">${Highcharts.numberFormat(p.y)}</span>
                        </div>
                    </div>
                `;
            }
        });

        if (!stack) {
            if (nonTargetPointCount) {
                tooltip_html += `
                        <div flex layout="row">
                            <div flex style="font-weight: bold">Total: </div>
                            <div flex-initial>
                                <span style="font-weight: bold">${Highcharts.numberFormat(total || targetTotal)}</span>
                            </div>
                        </div>
                `;
            }
        } if (calculateComparison) {
            tooltip_html += `
                    <div flex layout="row">
                        <div flex>Difference: </div>
                        <div flex-initial>
                            <span style="font-weight: bold">${Highcharts.numberFormat(calculateComparison.difference)}</span>
                        </div>
                    </div>
            `;
        }

        return tooltip_html;
    };
}

function tooltip_point_percentaje_total_formatter(stack?: string, sorting?: string) {
    this.exec = function () {

        let custom_tooltip_html = ``;
        let total = 0;

        let targetTotal = 0;
        let calculateComparison;
        let nonTargetPointCount = 0;
        let points;
        let totalStacks = new Set();

        this.points.forEach(point => {
            if (point.series.userOptions.type !== 'spline') {
                total += point.y;
            } else {
                targetTotal += point.y;
            }
        });

        this.points.forEach(p => {
            if (p.series.userOptions.hasOwnProperty('stack')) {
               totalStacks.add(p.series.userOptions.stack);
            }
        });

        if (!stack) {
            stack = this.points[0].series.userOptions.hasOwnProperty('stack') ? this.points[0].series.userOptions.stack : '';
        }

        if (totalStacks.size === 1 || (totalStacks.size === 2 && totalStacks.has('main'))) {
            calculateComparison = calculateComparisonDifference(this.points);
        }

             // beatriz code begins
        // to show the values in the tooltip sorted low to high 
        if (sorting === 'low_high') {
            points = this.points.sort(function(a, b){
            return ((a.y < b.y) ? -1 : ((a.y > b.y) ? 1 : 0));
        });
         }
         // to show the values in the tooltip sorted high to low
         else if(sorting === 'high_low'){
            points = this.points.sort(function(a, b){
            return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
            })
        }
        // no sorting 
         else{
             points = this.points;
         } 

         //- end beatriz code

        points.forEach(point => {
            if (point.series.userOptions.type === 'spline') {
                const targetPercent = ((point.y / targetTotal) * 100);
                custom_tooltip_html += `
                    <div flex layout="row">
                    <div flex style="color: ${point.color}">${point.series.name}:  </div>
                    <div flex-initial style="color: ${point.color}">
                        <span style="font-weight: bold">${Highcharts.numberFormat(point.y)} (${Highcharts.numberFormat(targetPercent)}%)</span>
                    </div>
                    </div>
                `;
                if (isNumber(point.series.userOptions.percentageCompletion)) {
                    custom_tooltip_html += `
                        <div flex layout="row">
                            <div flex style="color: ${point.color}">${point.series.name} (target progress): </div>
                            <div flex-initial style="color: ${point.color}">
                                <span style="font-weight: bold">${Highcharts.numberFormat(point.series.userOptions.percentageCompletion, 0)}%</span>
                            </div>
                        </div>
                    `;
                }

                custom_tooltip_html += `<div flex layout="row" class="p-b-5"></div>`;
            }
        });

        points.forEach(point => {
            if (point.series.userOptions.type !== 'spline') {
                const percentage = ((point.y / total) * 100);
                nonTargetPointCount = nonTargetPointCount + 1;
                custom_tooltip_html += `
                    <div flex layout="row">
                    <div flex style="color: ${point.color}">${point.series.name}:  </div>
                    <div flex-initial>
                        <span style="font-weight: bold">${Highcharts.numberFormat(point.y)} (${Highcharts.numberFormat(percentage)}%)</span>
                    </div>
                    </div>
                `;
            }
        });

        if (!stack) {
            if (nonTargetPointCount) {
                custom_tooltip_html += `
                    <div flex layout="row">
                    <div flex style="font-weight: bold">Total: </div>
                    <div flex-initial>
                        <span style="font-weight: bold">${Highcharts.numberFormat(total || targetTotal)} (100.00%)</span>
                    </div>
                    </div>
                `;
            }
            return custom_tooltip_html;
        } if(calculateComparison) {
            custom_tooltip_html += `
                <div flex layout="row">
                <div flex>Difference: </div>
                <div flex-initial>
                    <span style="font-weight: bold">${Highcharts.numberFormat(calculateComparison.difference)} (${Highcharts.numberFormat(calculateComparison.percentageDifference)}%)</span>
                </div>
                </div>
            `;
        }
        return custom_tooltip_html;

    };
}

function percent_with_total() {
    this.exec = function () {
        let custom_tooltip_html = ``;
        //- in mobile the points data will be inside this.points[0]
        const object = (this.key && this.point) ? this : this.points[0];
        const legend = object.key || object.point.name;
        custom_tooltip_html += `
            <div flex layout="row">
            <div flex>
                <span style="color: ${object.point.color}">${legend}</span>: 
            </div>
            <div flex-initial>
                <span style="font-weight: bold">${Highcharts.numberFormat(object.y)}</span>
            </div>
            </div>

            <div flex layout="row">
            <div flex style="font-weight: bold">Total: </div>
            <div flex-initial>
                <span style="font-weight: bold">${Highcharts.numberFormat(object.total)}</span>
            </div>
            </div>
        `;
        return custom_tooltip_html;
    };
}

function pie_with_total_percent_formatter() {
    this.exec = function() {
        let pie_percent_total_html = '';
        const object = (this.key && this.point) ? this : this.points[0];
        let legend: string = object.key || object.point.name;

        pie_percent_total_html += `
            <div flex layout="row">
                <div flex>
                    <span style="color: ${object.point.color}">${legend}</span>: 
                </div>
                <div flex-initial>
                    <span style="font-weight: bold">
                        ${Highcharts.numberFormat(object.y)} ( ${Highcharts.numberFormat(object.percentage)}% )
                    </span>
                </div>
            </div>

            <div flex layout="row">
                <div flex style="font-weight: bold">Total: </div>
                <div flex-initial>
                    <span style="font-weight: bold">${Highcharts.numberFormat(object.total)} ( 100% )</span>
                </div>
            </div>
        `;

        return pie_percent_total_html;
    };
}

function customShared(formatter: ICustomFormat) {
    this.exec = function () {
        let custom_tooltip_html = ``;
        let total = 0;
        let totalPorcent = '(100.00%)';

        const xStyle = getStyle(formatter.xValue);
        const serieStyle = getStyle(formatter.serieValue);
        const totalStyle = getStyle(formatter.totalValue);
        const yStyle = ' style="font-weight:bold; color:' + formatter.yValueColor + '"';

        this.points.forEach(point => {
            total += point.y;
        });
        // with x point
        if (formatter.xValue.enable) {
            custom_tooltip_html += `
                <div flex layout="row">
                    <div flex-initial style="text-align: right">
                        <span ` + xStyle + `>${this.x}</span>
                    </div>
                </div>
            `;
        }
        // shared with porcent
        if (formatter.altas_definition_id === 'percentage') {
            this.points.forEach(point => {
                const percentage = ((point.y / total) * 100);
                custom_tooltip_html += `
                            <div flex layout="row">`;
                if (formatter.serieValue.enable) {
                    custom_tooltip_html += `
                            <div flex` + serieStyle + `>${point.series.name}:  </div>`;
                }
                custom_tooltip_html += `
                            <div flex-initial">
                                <span ` + yStyle + `>` + formatter.prefix + `${Highcharts.numberFormat(point.y, formatter.decimals)} `
                                 + formatter.suffix + `(${Highcharts.numberFormat(percentage)}%)</span>
                            </div>
                            </div>
                        `;
            });
            // shared porcent only
        } else if (formatter.altas_definition_id === 'percent_only') {
            this.points.forEach(point => {
                const percentage = ((point.y / total) * 100);
                custom_tooltip_html += `
                            <div flex layout="row">`;
                if (formatter.serieValue.enable) {
                    custom_tooltip_html += `
                            <div flex` + serieStyle + `>${point.series.name}:  </div>`;
                }
                custom_tooltip_html += `
                            <div flex-initial>
                                <span ` + yStyle + `> ${Highcharts.numberFormat(percentage)}%</span>
                            </div>
                            </div>
                        `;
            });
        } else {
            // simple shared
            totalPorcent = '';
            this.points.forEach(point => {
                const percentage = ((point.y / total) * 100);
                custom_tooltip_html += `
                            <div flex layout="row">`;
                if (formatter.serieValue.enable) {
                    custom_tooltip_html += `
                            <div flex` + serieStyle + `>${point.series.name}:  </div>`;
                }
                custom_tooltip_html += `<div flex-initial>
                                <span ` + yStyle + `> ` + formatter.prefix + `${Highcharts.numberFormat(point.y, formatter.decimals)} `
                                 + formatter.suffix + `</span>
                            </div>
                            </div>
                        `;
            });
        }
        // TOTAL
        if (formatter.totalValue.enable) {
            custom_tooltip_html += `
                <div flex layout="row">`;
            // include serie
            if (formatter.serieValue.enable) {
                custom_tooltip_html += `
                <div flex>
                    <span ` + totalStyle + `>Total: </span>
                </div>`;
            }// porcent only
            if (formatter.altas_definition_id === 'percent_only') {
                custom_tooltip_html += `
                <div flex-initial>
                    <span ` + totalStyle + `> ` + totalPorcent + `</span>
                </div>
                </div>
            `;
                // total with porcent
            } else {
                custom_tooltip_html += `
                <div flex-initial>
                    <span ` + totalStyle + `>` + formatter.prefix + ` ${Highcharts.numberFormat(total)} `
                                 + formatter.suffix + totalPorcent + `</span>
                </div>
                </div>
            `;
            }
        }
        return custom_tooltip_html;
    };
}
// no shared
function custom(formatter: ICustomFormat) {
    this.exec = function () {
        let custom_tooltip_html = ``;
        let totalPorcent = '(100.00%)';

        const xStyle = getStyle(formatter.xValue);
        const serieStyle = getStyle(formatter.serieValue);
        const totalStyle = getStyle(formatter.totalValue);
        const yStyle = ' style="font-weight:bold; color:' + formatter.yValueColor + '"';

   
        // with x point
        if (formatter.xValue && formatter.xValue.enable) {
            custom_tooltip_html += `
                <div flex layout="row">
                    <div flex-initial style="text-align: right">
                        <span ` + xStyle + `>${this.x}</span>
                    </div>
                </div>
            `;
        }
        // with porcent
        if (formatter.altas_definition_id === 'percentage') {
            
           const percentage = ((this.y / this.total) * 100);
           
            custom_tooltip_html += `
                <div flex layout="row">`;
            if (formatter.serieValue && formatter.serieValue.enable) {
                custom_tooltip_html += `
                    <div flex` + serieStyle + `>${this.series.name}:  </div>`;
            }
            custom_tooltip_html += `
                    <div flex-initial">
                        <span ` + yStyle + `>` + formatter.prefix + `${Highcharts.numberFormat(this.y, formatter.decimals)} `
                        + formatter.suffix + `(${Highcharts.numberFormat(percentage)}%)</span>
                    </div>
                </div>
            `;
            // porcent only
        } else if (formatter.altas_definition_id === 'percent_only') {
           const percentage = ((this.y / this.total) * 100);

            custom_tooltip_html += `
                <div flex layout="row">`;
            if (formatter.serieValue && formatter.serieValue.enable) {
                custom_tooltip_html += `
                    <div flex` + serieStyle + `>${this.series.name}:  </div>`;
            }
            custom_tooltip_html += `
                    <div flex-initial>
                        <span ` + yStyle + `> ${Highcharts.numberFormat(percentage)}%</span>
                    </div>
                </div>
            `;
        } else {
            // simple
            totalPorcent = '';
          const percentage = ((this.y / this.total) * 100);

            custom_tooltip_html += `
                <div flex layout="row">`;
            if (formatter.serieValue && formatter.serieValue.enable) {
                custom_tooltip_html += `
                    <div flex` + serieStyle + `>${this.series.name}:  </div>`;
            }
            custom_tooltip_html += `
                    <div flex-initial>
                        <span ` + yStyle + `> ` + formatter.prefix + `${Highcharts.numberFormat(this.y, formatter.decimals)} `
                         + formatter.suffix + `</span>
                    </div>
                </div>
            `;
        }
        // TOTAL
        if (formatter.totalValue && formatter.totalValue.enable) {
            custom_tooltip_html += `
                <div flex layout="row">`;
            // include serie
            if (formatter.serieValue && formatter.serieValue.enable) {
                custom_tooltip_html += `
                <div flex>
                    <span ` + totalStyle + `>Total: </span>
                </div>`;
            }// porcent only
            if (formatter.altas_definition_id === 'percent_only') {
                custom_tooltip_html += `
                <div flex-initial>
                    <span ` + totalStyle + `> ` + totalPorcent + `</span>
                </div>
                </div>
            `;
                // total with porcent
            } else {
                custom_tooltip_html += `
                <div flex-initial>
                    <span ` + totalStyle + `>` + formatter.prefix +  `${Highcharts.numberFormat(this.total)} `
                    + formatter.suffix + totalPorcent + `</span>
                </div>
                </div>
            `;
            }
        }
        return custom_tooltip_html;
    };
}


export function FormatterFactory() {

    this.getFormatter = function (name, stack?: string) {
        let formatter;

        if (name === 'trim_tooltip_label') {
            formatter = new trim_tooltip_label_formatter();
        }

        if (name === 'percentage_target_default') {
            formatter = new percentage_target_default_formatter();
        }

        if (name === 'kpi_dollarize') {
            formatter = new dollarize();
        }

        if (name === 'kpi_tooltip_with_percentage_and_total') {
            formatter = new tooltip_point_percentaje_total_formatter(stack);
        }

        if (name === 'kpi_tooltip_multiple_percent_low_high') {
            formatter = new tooltip_point_percentaje_total_formatter(stack, 'low_high');
        }

        if (name === 'kpi_tooltip_multiple_percent_high_low') {
            formatter = new tooltip_point_percentaje_total_formatter(stack, 'high_low' );
        }

        if (name === 'kpi_tooltip_total') {
            formatter = new tooltip_total(stack);
        }

        if (name === 'kpi_tooltip_low_high') {
            formatter = new tooltip_total(stack, 'low_high');
        }

        if (name === 'kpi_tooltip_high_low') {
            formatter = new tooltip_total(stack, 'high_low');
        }

        if (name === 'kpi_percent_for_pie_chart') {
            formatter = new percent_pie_chart_formatter();
        }

        if (name === 'kpi_tooltip_pie_with_total') {
            formatter = new percent_with_total();
        }

        if (name === 'kpi_tooltip_pie_with_total_and_percent') {
            formatter = new pie_with_total_percent_formatter();
        }
        // if (name === 'custom') {
        //     formatter = new formatter_percent_with_total();
        // };

        if (formatter) {
            formatter.name = name;
        } else {

            // formatter = new customShared(name);
            formatter = (name.shared ? new customShared(name) : new custom(name));
            formatter.name = 'custom';
        }

        if (formatter) {
            formatter.name = name;
        } else {
            console.log('llego aquiiiiii');
            console.log(name);
            // formatter = new customShared(name);
            formatter = (name.shared ? new customShared(name) : new custom(name));
            formatter.name = 'custom';
        }
        return formatter;
    };
}


export function yAxisFormatterProcess(definition: any) {
    if (definition && definition.chart && definition.chart.type) {
        if (definition.chart.type !== 'pie') {
            if (!definition.yAxis) {
                definition.yAxis = {};
            }
            if (!definition.yAxis.labels) {
                definition.yAxis.labels = {};
            }

            // show negative values for column charts
            if (definition.chart.type === 'column' &&
                definition.yAxis &&
                isNumber(definition.yAxis.min)) {
                    delete definition.yAxis.min;
            }

            definition.yAxis.labels.formatter = function () {
                let num = this.value.toString();
                const numLength = num.replace('-', '').length;

                switch (numLength) {
                    // trillion
                    case 15:
                    case 14:
                    case 13:
                        num = num.replace(/0+$/, '');
                        switch (num.length) {
                            case 1:
                                return num + 't';
                            default:
                                return `${num.substring(0, 1)}.${num.substring(1, num.length)}t`;
                        }
                    // billion
                    case 12:
                    case 11:
                    case 10:
                        num = num.replace(/0+$/, '');
                        switch (num.length) {
                            case 1:
                                return num + 'b';
                            default:
                                return `${num.substring(0, 1)}.${num.substring(1, num.length)}b`;
                        }
                    // million
                    case 9:
                        if (num[3] && parseInt(num[3], 10) !== 0) {
                            num = num.replace(/0+$/, '');
                            return `${num.substring(0, 3)}.${num.substring(3, num.length)}`;
                        }
                        return `${num.substring(0, 3)}m`;
                    case 8:
                        if (num[3] && parseInt(num[3], 10) !== 0) {
                            num = num.replace(/0+$/, '');
                            return `${num.substring(0, 2)}.${num.substring(2, num.length)}`;
                        }
                        return `${num.substring(0, 2)}m`;
                    case 7:
                        num = num.replace(/0+$/, '');
                        // num can be 1, 12, 152
                        // translate to 1m, 1.2m, 1.52m
                        switch (num.length) {
                            case 1:
                                return num + 'm';
                            default:
                                return `${num.substring(0, 1)}.${num.substring(1, num.length)}m`;
                        }
                    // thousand
                    case 6:
                        return `${num.substring(0, 3)}k`;
                    case 5:
                        return `${num.substring(0, 2)}k`;
                    case 4:
                        if (parseInt(num[1], 10) === 0) {
                            return `${num.substring(0, 1)}k`;
                        }
                        return `${num.substring(0, 1)}.${num.substring(1, 2)}k`;
                    default:
                        return num;
                }
            };
        } else {
            delete definition.yAxis;
        }
    }
}
function getStyle(value: Itypography, align?: string) {
    let style = '';
    if (value && value.enable) {
        style = style + ' style="font-size:' + value.size + 'px'
            + '; color:' + value.color + '';
        if (value.black) {
            style = style + '; font-weight:bold';
        }
        if (value.cursive) {
            style = style + '; font-style:italic';
        }
        if (value.under) {
            style = style + '; text-decoration:underline';
        }
        if (align) {
            style = style + '; text-align:' + align;
        }
        style = style + '"';
    }
    return style;
}
