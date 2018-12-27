import { ChooseColorsComponent } from './../choose-colors/choose-colors.component';
import { isNumber } from 'lodash';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectionItem } from '../../../../ng-material-components';
import { ChartGalleryService } from '../../services';
import { predefinedColors, labelItems } from './material-colors';

const ExpensesGroupingList = [
    { id: 'location', title: 'location', selected: false, disabled: false },
    { id: 'businessUnit', title: 'businessUnit', selected: false, disabled: false },
    { id: 'concept', title: 'concept', selected: false, disabled: false }
];

@Component({
  selector: 'kpi-chart-format-info',
  templateUrl: './chart-format-info.component.pug',
  styleUrls: ['./chart-format-info.component.scss']
})
export class ChartFormatInfoComponent implements OnInit, AfterViewInit {
  @Input() fg: FormGroup;
  @Input() chartDefinition: any;
  @Input() isLegendEnabled: boolean|string;
  @Input() isInvertAxisEnabled: boolean|string;
  @Input() isRemoveGridlinesEnabled: boolean|string;
  @Input() tooltip_state: any;

  @Output() TooltipChanges = new EventEmitter <any>();
  @Output() labelItemsColorsChanges = new EventEmitter <any>();
  @Output() serieColorChange = new EventEmitter <any>();
  @ViewChild(ChooseColorsComponent) chooseColors: ChooseColorsComponent;

  chartType: string;

  yAxisNumberFormatList: SelectionItem[] = [
    { id: null, title: 'Default', selected: false, disabled: false },
    { id: 'custom', title: 'Custom', selected: false, disabled: false },
    { id: 'dollars', title: 'Dollars', selected: false, disabled: false },
    { id: 'millions', title: 'Millions', selected: false, disabled: false },
  ];

  sizeTypes: SelectionItem[] = [
        { id: '8', title: '8' },
        { id: '9', title: '9' },
        { id: '10', title: '10' },
        { id: '11', title: '11' },
        { id: '12', title: '12' },
        { id: '13', title: '13' },
        { id: '14', title: '14' },
        { id: '15', title: '15' },
        { id: '16', title: '16' },
        { id: '17', title: '17' },
        { id: '18', title: '18' },
        { id: '19', title: '19' },
        { id: '20', title: '20' },
        { id: '72', title: '72' },
        ];

 /*  colorList: SelectionItem[] = [
        {  id: '#000000', title: 'black'},
        {  id: '#f53168', title: 'red'},
        {  id: '#ffa34a', title: 'orange'},
        {  id: '#2fb6fc', title: 'blue'},
        {  id: '#22b4ad', title: 'green'},
        {  id: '#75cd92', title: 'light-green'},
        {  id: '#8BC34A', title: 'sei-green'},
        {  id: '#b186e6', title: 'purple'},
        {  id: '#6280ff', title: 'light-purple'},
  ]; */

  predefinedColors = predefinedColors;

  selectedLabel: number;

  labelItems = labelItems;

  toolTipFormatList: SelectionItem[] = [];

  isCollapsedOtherOptions = true;

  selectedSerieName: string;

  constructor(private _galleryService: ChartGalleryService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const that = this;
    this._galleryService.activeChart$.subscribe(chart => {
      that.chartType = chart.name;
      that._updateTooltipList();
    });
    this._setTooltipListReady();
  }

  private _updateTooltipList() {
    const that = this;
    this._galleryService.toolTipList$.subscribe(list => {
      that.toolTipFormatList = list.map(f => {
        return new SelectionItem(f.id, f.title, false, false);
         });
    });
  }

  private _setTooltipListReady() {
    const that = this;
    // const list = TooltipFormats.filter(f => {
    //   return (f.id !== 'multiple') && (f.id !== 'multiple_percent');
    // });

    // this.toolTipFormatList = list.map(f => {
    //   return new SelectionItem(f.id, f.title, false, false);
    // });

    this._galleryService.toolTipList$.subscribe(list => {
      that.toolTipFormatList = list.map(f => {
        return new SelectionItem(f.id, f.title, false, false);
      });
    });
  }

  get isPie(): boolean {
    if (!this.chartDefinition || !this.chartDefinition.chart) {
      return false;
    }
    return this.chartDefinition.chart.type === 'pie';
  }

  extendedDecimals() {
    const tooltip = Object.assign( {format: '', valueDecimals: ++this.tooltip_state.decimals});
    this.TooltipChanges.emit(tooltip);
  }

  removeDecimals() {
    const tooltip = Object.assign( {format: '', valueDecimals: 0});
    this.TooltipChanges.emit(tooltip);
  }

  pie_percent() {
    const tooltip = Object.assign({format: 'percentage', valueDecimals: this.tooltip_state.decimals});
    this.TooltipChanges.emit(tooltip);
  }

  default() {
    const tooltip = Object.assign( {format: 'simple', valueDecimals: this.tooltip_state.decimals});
    this.TooltipChanges.emit(tooltip);
  }

  percent_only() {
    const tooltip = Object.assign( {format: 'percent_only', valueDecimals: this.tooltip_state.decimals});
    this.TooltipChanges.emit(tooltip);
  }

  getSerieColorForChartDefinition(chartDefinition) {
    if (chartDefinition && chartDefinition.colors) {
      const serieColors = chartDefinition.colors;
      for (let i = 0; i < serieColors.length; i++) {
        this.labelItems[i].color = serieColors[i];
        this.labelItems[i].enabled = true;

        if (i !== 9) {
          this.labelItems[i + 1].enabled = true;
        }
      }
    }
  }

  defaultChartColors() {
    const defaultTheme = this.predefinedColors.find(c => c.id === 'default');
    for (let i = 0; i < 10; i++) {
      const color = defaultTheme.colors[i];

      this.labelItems[i].color = color;
      this.labelItems[i].enabled = true;
    }
  }

  private _resetLabelItemsColor() {
    this.labelItems.map(i => {
      i.color = '';
      if (i.id === 1) {
        i.enabled = true;
      } else {
        i.enabled = false;
      }
    });
  }

  onSelectTheme(colorId) {
    if (colorId === 'blank') {
      this._resetLabelItemsColor();
    } else {
      const selectedTheme = this.predefinedColors.find(c => c.id === colorId);
      for (let i = 0; i < 10; i++) {
        const color = selectedTheme.colors[i];

        this.labelItems[i].color = color;
        this.labelItems[i].enabled = true;
      }
    }
    this.labelItemsColorsChanges.emit(this.labelItems);
  }

  onSelectColorTheme(label) {
    if (label.enabled === true) {
      this.openSelectColor(label.id);
    }
  }

  openSelectColor(inputValue) {
    const isNumberValue = isNumber(inputValue);
    this.selectedSerieName = isNumberValue ? undefined : inputValue;
    this.selectedLabel = isNumberValue ? inputValue : undefined;
    this.chooseColors.open();
  }

  onSelectColor(color) {
    if (this.selectedSerieName) {
      this._setSerieColor(color);
    } else {
      const labelIndex = this.labelItems.findIndex(i => i.id === this.selectedLabel);
      this.labelItems[labelIndex].color = color;
      if (this.selectedLabel < 10) {
        this._enableNextLabelItem();
      }
      this.labelItemsColorsChanges.emit(this.labelItems);
    }
  }

  private _enableNextLabelItem() {
    const nextLabelIndex = this.labelItems.findIndex(i => i.id === this.selectedLabel + 1);
    this.labelItems[nextLabelIndex].enabled = true;
  }

  private _setSerieColor(color) {
    let serieData: any;
    if (this.chartDefinition.chart.type === 'pie') {
      serieData = this.chartDefinition.series[0].data.find(serie => serie.name === this.selectedSerieName);
    } else {
      serieData = this.chartDefinition.series.find(serie => serie.name === this.selectedSerieName);
    }

    if (serieData) { serieData.color = color; }
    this.serieColorChange.emit(this.chartDefinition);
  }

}
