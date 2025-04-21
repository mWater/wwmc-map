import Tab from './Tab';
import { unitToString } from '../unit';
import moment from 'moment';
import DataTabTemplate from './DataTab.hbs';
import DataSubTabTemplate from './DataSubTab.hbs';
import _ from 'lodash';
import { Chart, ChartConfiguration } from 'chart.js';

interface Quantity {
  quantity: number;
  units: string;
}

interface VisitData {
  date: string;
  ph?: number;
  turbidity?: Quantity;
  water_temperature?: Quantity;
  dissolved_oxygen?: Quantity;
  dissolved_oxygen_saturation?: Quantity;
  nitrite?: Quantity;
  nitrate?: Quantity;
  phosphate?: Quantity;
}

interface Measure {
  date: string;
  formattedDate: string;
  ph?: number;
  turbidity?: number;
  turbidityUnit?: string;
  waterTemperature?: number;
  waterTemperatureUnit?: string;
  dissolvedOxygen?: number;
  dissolvedOxygenUnit?: string;
  dissolvedOxygenSaturation?: number;
  dissolvedOxygenSaturationUnit?: string;
  nitrite?: number;
  nitriteUnit?: string;
  nitrate?: number;
  nitrateUnit?: string;
  phosphate?: number;
  phosphateUnit?: string;
}

interface ChartValue {
  date: string;
  formattedDate: string;
  value: number;
  valueWithUnit: string;
}

export class DataTab {
  private data: any[] = [];
  private subContent: JQuery = $();

  constructor(data: any[]) {
    this.data = data;
    this.render();
  }

  protected initialize(): void {
    for (const visitData of this.visitsData as VisitData[]) {
      const measures: Measure = {
        date: visitData.date,
        formattedDate: visitData.date.length <= 10
          ? moment(visitData.date, moment.ISO_8601).format("ll")
          : moment(visitData.date, moment.ISO_8601).format("lll")
      };

      if (visitData.ph !== undefined) {
        measures.ph = visitData.ph;
      }

      if (visitData.turbidity) {
        measures.turbidity = visitData.turbidity.quantity;
        measures.turbidityUnit = visitData.turbidity.units;
      }

      if (visitData.water_temperature) {
        measures.waterTemperature = visitData.water_temperature.quantity;
        measures.waterTemperatureUnit = visitData.water_temperature.units;
      }

      if (visitData.dissolved_oxygen) {
        measures.dissolvedOxygen = visitData.dissolved_oxygen.quantity;
        measures.dissolvedOxygenUnit = visitData.dissolved_oxygen.units;
      }

      if (visitData.dissolved_oxygen_saturation) {
        measures.dissolvedOxygenSaturation = visitData.dissolved_oxygen_saturation.quantity;
        measures.dissolvedOxygenSaturationUnit = visitData.dissolved_oxygen_saturation.units;
      }

      if (visitData.nitrate) {
        measures.nitrate = visitData.nitrate.quantity;
        measures.nitrateUnit = visitData.nitrate.units;
      }

      if (visitData.nitrite) {
        measures.nitrite = visitData.nitrite.quantity;
        measures.nitriteUnit = visitData.nitrite.units;
      }

      if (visitData.phosphate) {
        measures.phosphate = visitData.phosphate.quantity;
        measures.phosphateUnit = visitData.phosphate.units;
      }

      this.data.push(measures);
    }

    this.content.html(DataTabTemplate());

    this.subContent = this.content.find("#subContent");

    this.content.find("#selector").on('change', (e: JQuery.Event) => {
      const selected = $('#selector option').filter(':selected')[0] as HTMLOptionElement;
      this.render(selected.value);
    });

    this.render('ph');
  }

  private render(type: string): void {
    const values: ChartValue[] = [];
    if (type === "ph") {
      for (const value of this.data) {
        if (value.ph !== undefined) {
          values.push({
            date: value.date,
            formattedDate: value.formattedDate,
            value: value.ph,
            valueWithUnit: value.ph.toString()
          });
        }
      }
    } else if (type === "water_temperature") {
      for (const value of this.data) {
        if (value.waterTemperature !== undefined) {
          const valueWithUnit = value.waterTemperature + " " + unitToString(type, value.waterTemperatureUnit || "");
          values.push({
            date: value.date,
            formattedDate: value.formattedDate,
            value: value.waterTemperature,
            valueWithUnit
          });
        }
      }
    } else if (type === "dissolved_oxygen") {
      for (const value of this.data) {
        if (value.dissolvedOxygen !== undefined) {
          const valueWithUnit = value.dissolvedOxygen + " " + unitToString(type, value.dissolvedOxygenUnit || "");
          values.push({
            date: value.date,
            formattedDate: value.formattedDate,
            value: value.dissolvedOxygen,
            valueWithUnit
          });
        }
      }
    } else if (type === "dissolved_oxygen_saturation") {
      for (const value of this.data) {
        if (value.dissolvedOxygenSaturation !== undefined) {
          const valueWithUnit = value.dissolvedOxygenSaturation + " " + unitToString(type, value.dissolvedOxygenSaturationUnit || "");
          values.push({
            date: value.date,
            formattedDate: value.formattedDate,
            value: value.dissolvedOxygenSaturation,
            valueWithUnit
          });
        }
      }
    } else if (type === "nitrite") {
      for (const value of this.data) {
        if (value.nitrite !== undefined) {
          const valueWithUnit = value.nitrite + " " + unitToString(type, value.nitriteUnit || "");
          values.push({
            date: value.date,
            formattedDate: value.formattedDate,
            value: value.nitrite,
            valueWithUnit
          });
        }
      }
    } else if (type === "nitrate") {
      for (const value of this.data) {
        if (value.nitrate !== undefined) {
          const valueWithUnit = value.nitrate + " " + unitToString(type, value.nitrateUnit || "");
          values.push({
            date: value.date,
            formattedDate: value.formattedDate,
            value: value.nitrate,
            valueWithUnit
          });
        }
      }
    } else if (type === "phosphate") {
      for (const value of this.data) {
        if (value.phosphate !== undefined) {
          const valueWithUnit = value.phosphate + " " + unitToString(type, value.phosphateUnit || "");
          values.push({
            date: value.date,
            formattedDate: value.formattedDate,
            value: value.phosphate,
            valueWithUnit
          });
        }
      }
    }

    if (values.length === 0) {
      this.subContent.html("<br>No data");
    } else if (values.length === 1) {
      const value = values[0];
      this.subContent.html(DataSubTabTemplate({
        date: value.formattedDate,
        singleValue: value.valueWithUnit
      }));
    } else if (values.length === 2) {
      const newValue = values[1];
      const oldValue = values[0];
      this.subContent.html(DataSubTabTemplate({
        newValue: newValue.valueWithUnit,
        newDate: newValue.formattedDate,
        oldValue: oldValue.valueWithUnit,
        oldDate: oldValue.formattedDate
      }));
    } else {
      const graphWidth = values.length <= 20 ? 400 : 400 + (values.length - 20) * 20;
      const graphHeight = values.length <= 20 ? 225 : 200;
      this.subContent.html(DataSubTabTemplate({
        drawGraph: true,
        graphWidth,
        graphHeight
      }));
      this.renderLineChart(type, values);
    }
  }

  private renderLineChart(type: string, values: ChartValue[]): void {
    const canvas = this.subContent.find("#dataChart").get(0);
    if (!canvas) return;
    
    const ctx = (canvas as HTMLCanvasElement).getContext("2d");
    if (!ctx) return;

    const options: any = {
      fillColor: "rgba(151,187,205,0.2)",
      strokeColor: "rgba(151,187,205,1)",
      pointColor: "rgba(151,187,205,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(151,187,205,1)",
      data: _.map(values, "value")
    };

    if (type === 'ph') {
      options.label = "pH";
    } else if (type === 'water_temperature') {
      options.label = "Water Temperature";
    } else if (type === 'dissolved_oxygen') {
      options.label = "Dissolved Oxygen";
    } else if (type === 'dissolved_oxygen_saturation') {
      options.label = "Dissolved Oxygen Saturation";
    } else if (type === 'nitrate') {
      options.label = "Nitrate";
    } else if (type === 'nitrite') {
      options.label = "Nitrite";
    } else if (type === 'phosphate') {
      options.label = "Phosphate";
    }

    const datasets = [options];
    const data: ChartConfiguration = {
      type: 'line',
      data: {
        labels: _.map(_.map(values, "date"), (d: string) => d ? d.substr(0, 10) : ""),
        datasets: datasets
      },
      options: {
        elements: {
          point: {
            radius: 2,
            hitRadius: 2
          }
        }
      }
    };

    new Chart(ctx, data);
  }
} 