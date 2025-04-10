import Tab from './Tab';
import { unitToString } from '../unit';
import moment from 'moment';
import HistoryTabTemplate from './HistoryTab.hbs';

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
  ph?: number;
  turbidity?: string;
  waterTemperature?: string;
  dissolvedOxygen?: string;
  dissolvedOxygenSaturation?: string;
  nitrite?: string;
  nitrate?: string;
  phosphate?: string;
  hasPhosphate?: boolean;
  hasNitrate?: boolean;
  hasNitrite?: boolean;
}

export default class HistoryTab extends Tab {
  constructor(content: JQuery) {
    super(content);
  }

  protected initialize(): void {
    const data: Measure[] = [];
    let hasNitrite = false;
    let hasNitrate = false;
    let hasPhosphate = false;

    for (const visitData of [...this.visitsData].reverse() as VisitData[]) {
      const measures: Measure = {
        date: visitData.date.length <= 10 
          ? moment(visitData.date, moment.ISO_8601).format("ll")
          : moment(visitData.date, moment.ISO_8601).format("lll")
      };

      if (visitData.ph) {
        measures.ph = visitData.ph;
      }

      if (visitData.turbidity?.quantity) {
        measures.turbidity = `${visitData.turbidity.quantity} ${unitToString("turbidity", visitData.turbidity.units)}`;
      }

      if (visitData.water_temperature?.quantity) {
        measures.waterTemperature = `${visitData.water_temperature.quantity} ${unitToString("water_temperature", visitData.water_temperature.units)}`;
      }

      if (visitData.dissolved_oxygen?.quantity) {
        measures.dissolvedOxygen = `${visitData.dissolved_oxygen.quantity} ${unitToString("dissolved_oxygen", visitData.dissolved_oxygen.units)}`;
      }

      if (visitData.dissolved_oxygen_saturation?.quantity) {
        measures.dissolvedOxygenSaturation = `${visitData.dissolved_oxygen_saturation.quantity} ${unitToString("dissolved_oxygen_saturation", visitData.dissolved_oxygen_saturation.units)}`;
      }

      if (visitData.nitrite?.quantity) {
        hasNitrite = true;
        measures.nitrite = `${visitData.nitrite.quantity} ${unitToString("nitrite", visitData.nitrite.units)}`;
      }

      if (visitData.nitrate?.quantity) {
        hasNitrate = true;
        measures.nitrate = `${visitData.nitrate.quantity} ${unitToString("nitrate", visitData.nitrate.units)}`;
      }

      if (visitData.phosphate?.quantity) {
        hasPhosphate = true;
        measures.phosphate = `${visitData.phosphate.quantity} ${unitToString("phosphate", visitData.phosphate.units)}`;
      }

      data.push(measures);
    }

    for (const d of data) {
      d.hasPhosphate = hasPhosphate;
      d.hasNitrate = hasNitrate;
      d.hasNitrite = hasNitrite;
    }

    this.content.html(HistoryTabTemplate({
      data,
      hasNoData: data.length === 0,
      hasNitrite,
      hasNitrate,
      hasPhosphate
    }));
  }
} 