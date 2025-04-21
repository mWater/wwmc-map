import Tab from './Tab';
import { unitToString } from '../unit';
import moment from 'moment';
import WaterActionTabTemplate from './WaterActionTab.hbs';
import PloggingTableTemplate from './PloggingTable.hbs';

interface Option {
  id: string;
  label: {
    en: string;
    _base: string;
  };
}

interface Duration extends Option {}

interface VisitData {
  date: string;
  pieces_collected?: number;
  participants?: number;
  duration?: string;
  bags_used?: number;
  distance?: {
    quantity: number;
    units: string;
  };
  total_weight?: {
    quantity: number;
    units: string;
  };
}

interface WaterActionData {
  plogging: VisitData[];
}

const durations: Duration[] = [
  { "id": "eJzaU1w", "label": { "en": "5 minutes", "_base": "en" } },
  { "id": "dBF76uD", "label": { "en": "15 minutes", "_base": "en" } },
  { "id": "sekt45H", "label": { "en": "30 minutes", "_base": "en" } },
  { "id": "jlCLQTQ", "label": { "en": "1+ hour", "_base": "en" } }
];

const posterOptions: Option[] = [
  { "id": "4gEt9hY", "label": { "en": "Yes", "_base": "en" } },
  { "id": "sxRjm6r", "label": { "en": "No", "_base": "en" } }
];

const affiliations: Option[] = [
  { "id": "vbvSy2S", "label": { "en": "School", "_base": "en" } },
  { "id": "CdbSvWD", "label": { "en": "Organization", "_base": "en" } },
  { "id": "vShkZmm", "label": { "en": "Group name", "_base": "en" } },
  { "id": "78q4BkC", "label": { "en": "None", "_base": "en" } }
];

export class WaterActionTab {
  private subContent: JQuery = $();

  constructor(data: any[]) {
    this.render(data);
  }

  protected initialize(): void {
    this.content.html(WaterActionTabTemplate());

    this.subContent = this.content.find("#subContent");

    this.content.find("#waterActionSelector").on('change', (e: JQuery.ChangeEvent) => {
      const selected = $('#waterActionSelector option').filter(':selected')[0] as HTMLOptionElement;
      this.render(selected.value);
    });

    this.render('plogging');
  }

  private render(type: string): void {
    if (type === "plogging") {
      const data: any[] = [];
      for (const visitData of [...this.visitsData["plogging"]].reverse()) {
        const measures: any = {
          date: visitData.date.length <= 10
            ? moment(visitData.date, moment.ISO_8601).format("ll")
            : moment(visitData.date, moment.ISO_8601).format("lll")
        };

        if (visitData.pieces_collected !== undefined) {
          measures.pieces_collected = visitData.pieces_collected;
        }

        if (visitData.participants !== undefined) {
          measures.participants = visitData.participants;
        }

        if (visitData.duration !== undefined) {
          const duration = durations.find(d => d.id === visitData.duration);
          if (duration) {
            measures.duration = duration.label.en;
          }
        }

        if (visitData.bags_used !== undefined) {
          measures.bags_used = visitData.bags_used;
        }

        if (visitData.distance?.quantity !== undefined) {
          measures.distance = `${visitData.distance.quantity} ${unitToString("distance", visitData.distance.units)}`;
        }

        if (visitData.total_weight?.quantity !== undefined) {
          measures.total_weight = `${visitData.total_weight.quantity} ${unitToString("total_weight", visitData.total_weight.units)}`;
        }

        data.push(measures);
      }

      this.subContent.html(PloggingTableTemplate({
        data,
        hasNoData: data.length === 0
      }));
    }
  }
} 