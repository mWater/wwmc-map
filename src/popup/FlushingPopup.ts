import moment from 'moment';
import { unitToString } from '../unit';
import FlushingPopupTemplate from './FlushingPopup.hbs';
import Backbone from 'backbone';

interface Option {
  id: string;
  label: {
    en: string;
    _base: string;
  };
}

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

interface FlushingField {
  questionId: string;
  field: string;
  choiceId?: string;
  multi?: boolean;
}

interface FlushingData {
  date: string;
  affiliation?: string;
  affiliation_name?: string;
  participants?: number;
  poster?: string;
  pictures?: Array<{ id: string }>;
}

interface ResponseData {
  [key: string]: {
    value: any;
  };
}

interface Response {
  data: ResponseData;
}

const flushingFields: FlushingField[] = [
  { questionId: '9e40eb8f50c8417bb0338c884f3916a1', field: 'date' },
  { questionId: 'b907c273299a40c8afbfa0fb00ec63bf', field: 'affiliation' },
  { questionId: '29814a936c6941c7b16a4c8803412f31', field: 'affiliation_name' },
  { questionId: '1f4481c41936423fb957cb705c464211', field: 'participants' },
  { questionId: 'cbe19b8328374cb38da6494ba922f0f3', field: 'poster' },
  { questionId: 'f41bcf066ccf41598a6decf8f0624984', field: 'pictures' }
];

function createFlushingChallengeData(response: Response): FlushingData {
  const flushingData: FlushingData = {};
  
  for (const field of flushingFields) {
    const answer = response.data[field.questionId];
    if (answer?.value !== undefined) {
      if (field.choiceId) {
        if (field.multi) {
          flushingData[field.field] = answer.value.indexOf(field.choiceId) >= 0;
        } else {
          flushingData[field.field] = answer.value === field.choiceId;
        }
      } else {
        flushingData[field.field] = answer.value;
      }
    }
  }

  return flushingData;
}

interface FlushingPopupOptions {
  ctx: any;
  response: Response;
}

export default class FlushingPopup extends Backbone.View {
  private options: FlushingPopupOptions;
  private ctx: any;
  private response: Response;

  constructor(options: FlushingPopupOptions) {
    super();
    this.options = options;
    this.ctx = options.ctx;
    this.response = options.response;
  }

  render(): this {
    const flushingData = createFlushingChallengeData(this.response);
    const photoIds: string[] = [];
    const data: any = {
      date: flushingData.date.length <= 10
        ? moment(flushingData.date, moment.ISO_8601).format("ll")
        : moment(flushingData.date, moment.ISO_8601).format("lll")
    };

    if (flushingData.affiliation) {
      data.affiliation = affiliations.find(d => d.id === flushingData.affiliation)?.label.en;
    }

    if (flushingData.participants) {
      data.participants = flushingData.participants;
    }

    if (flushingData.affiliation_name) {
      data.affiliation_name = flushingData.affiliation_name;
    }

    if (flushingData.poster) {
      data.poster = posterOptions.find(d => d.id === flushingData.poster)?.label.en;
    }

    if (flushingData.pictures?.length) {
      for (const photo of flushingData.pictures) {
        photoIds.push(photo.id);
      }
    }

    this.$el.html(FlushingPopupTemplate({ data, photoIds }));
    return this;
  }
} 