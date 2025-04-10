import { unitToString } from '../unit';
import DataTab from './DataTab';
import SpeciesTab from './SpeciesTab';
import PhotosTab from './PhotosTab';
import HistoryTab from './HistoryTab';
import WaterActionTab from './WaterActionTab';
import moment from 'moment';
import Backbone from 'backbone';
import PopupViewTemplate from './PopupView.hbs';
import _ from 'lodash';

interface QuestionAndField {
  questionId: string;
  field: string;
  choiceId?: string;
  multi?: boolean;
}

interface VisitData {
  date: string;
  turbidity?: any;
  water_temperature?: any;
  dissolved_oxygen?: any;
  dissolved_oxygen_saturation?: any;
  ph?: number;
  nitrate?: any;
  nitrite?: any;
  phosphate?: any;
  photos?: Array<{ id: string }>;
  macroinvertebrate_data_available?: boolean;
  caddisflies_present?: boolean;
  dobsonflies_present?: boolean;
  mayflies_present?: boolean;
  stoneflies_present?: boolean;
  craneflies_present?: boolean;
  dragonflies_present?: boolean;
  scuds_present?: boolean;
  leeches_present?: boolean;
  midges_present?: boolean;
  pounch_snails_present?: boolean;
  tubiflex_worms_present?: boolean;
}

interface PhotoData {
  photoIds: string[];
  date: string;
}

interface WaterActionData {
  date: string;
  participants?: number;
  duration?: number;
  distance?: number;
  pieces_collected?: number;
  bags_used?: number;
  total_weight?: number;
  before_image?: Array<{ id: string }>;
  after_image?: Array<{ id: string }>;
}

interface ResponseData {
  [key: string]: {
    value: any;
  };
}

interface Response {
  data: ResponseData;
  submittedOn: string;
}

interface Site {
  _id: string;
  code: string;
  photo?: {
    id: string;
  };
}

interface PopupViewOptions {
  ctx: {
    apiUrl: string;
  };
  site: Site;
}

const questionAndFields: QuestionAndField[] = [
  { questionId: 'efb614336f504f31a312581e2283a8b2', field: 'date' },
  { questionId: 'f4725a40f1474bd6a9c16df63865e1d8', field: 'turbidity' },
  { questionId: 'd5cf3fc485164dd5b9ef0edbaacfdeac', field: 'water_temperature' },
  { questionId: '446ad384f0d64fc9baf2b810c5fba2ac', field: 'dissolved_oxygen' },
  { questionId: 'ea33bee55ce24dc1a2eaab2c5a6e679b', field: 'dissolved_oxygen_saturation' },
  { questionId: 'e05e0afdff824cf3bbc3aefcfadc96ee', field: 'ph' },
  { questionId: 'd03de1a11d324de5b3b1d197f24c1519', field: 'nitrate' },
  { questionId: 'ec09f13bc97a433ba8f89c1c34273a9f', field: 'nitrite' },
  { questionId: 'eff5e181612541f9b04b33d39a17715d', field: 'phosphate' },
  { questionId: 'd28f9ed8ac2445f9900e6cb231d136d9', field: 'photos' },
  { questionId: 'f146785697ac4d29821a6969e909ee20', choiceId: 'He4yspy', field: 'macroinvertebrate_data_available', multi: false },
  { questionId: 'f02ec505ef114deca7e7735247b7821b', choiceId: '8R5P9ST', field: 'caddisflies_present', multi: true },
  { questionId: 'f02ec505ef114deca7e7735247b7821b', choiceId: 'dbBRlKD', field: 'dobsonflies_present', multi: true },
  { questionId: 'f02ec505ef114deca7e7735247b7821b', choiceId: '7ZU8Yjg', field: 'mayflies_present', multi: true },
  { questionId: 'f02ec505ef114deca7e7735247b7821b', choiceId: '9QfVGsF', field: 'stoneflies_present', multi: true },
  { questionId: 'fc27a75ece87477aa59f0193b8afd4ce', choiceId: 'kkEEkks', field: 'craneflies_present', multi: true },
  { questionId: 'fc27a75ece87477aa59f0193b8afd4ce', choiceId: 'h7yvJDd', field: 'dragonflies_present', multi: true },
  { questionId: 'fc27a75ece87477aa59f0193b8afd4ce', choiceId: 'Rx7u6Tp', field: 'scuds_present', multi: true },
  { questionId: 'ce3c95486d214836823d030386a64e50', choiceId: 'h7yvJDd', field: 'leeches_present', multi: true },
  { questionId: 'ce3c95486d214836823d030386a64e50', choiceId: 'Rx7u6Tp', field: 'midges_present', multi: true },
  { questionId: 'ce3c95486d214836823d030386a64e50', choiceId: 'AK3NYkv', field: 'pounch_snails_present', multi: true },
  { questionId: 'ce3c95486d214836823d030386a64e50', choiceId: 'qxmSzcj', field: 'tubiflex_worms_present', multi: true }
];

const ploggingFields: QuestionAndField[] = [
  { questionId: '9e40eb8f50c8417bb0338c884f3916a1', field: 'date' },
  { questionId: '1f4481c41936423fb957cb705c464211', field: 'participants' },
  { questionId: '9085b1fa84fe4aefb94bd8961ecb124b', field: 'duration' },
  { questionId: '180c81c0d6ae4fa2958dacc8a03972d8', field: 'distance' },
  { questionId: '07f214b201ff439799b64bf2be51d53d', field: 'pieces_collected' },
  { questionId: '2b6235f00fd24ebfba827a3a5cf14211', field: 'bags_used' },
  { questionId: '619ed15f7a4e44bfbcc0bf5fc71fe98e', field: 'total_weight' },
  { questionId: '5ce187b6fa8b484a9aacf4e10fc7db4c', field: 'before_image' },
  { questionId: '2c3c478fd2ce42a3b269a069191ec83f', field: 'after_image' }
];

function createVisitsData(responses: Response[]): VisitData[] {
  return responses.map(response => {
    const visitData: VisitData = {};
    for (const questionAndField of questionAndFields) {
      const answer = response.data[questionAndField.questionId];
      if (answer?.value !== undefined) {
        if (questionAndField.choiceId) {
          if (questionAndField.multi) {
            visitData[questionAndField.field] = answer.value.indexOf(questionAndField.choiceId) >= 0;
          } else {
            visitData[questionAndField.field] = answer.value === questionAndField.choiceId;
          }
        } else {
          visitData[questionAndField.field] = answer.value;
        }
      }
    }
    return visitData;
  });
}

function createWaterActionData(responses: Response[], fields: QuestionAndField[]): WaterActionData[] {
  return responses.map(response => {
    const ploggingData: WaterActionData = {};
    for (const field of fields) {
      const answer = response.data[field.questionId];
      if (answer?.value !== undefined) {
        if (field.choiceId) {
          if (field.multi) {
            ploggingData[field.field] = answer.value.indexOf(field.choiceId) >= 0;
          } else {
            ploggingData[field.field] = answer.value === field.choiceId;
          }
        } else {
          ploggingData[field.field] = answer.value;
        }
      }
    }
    return ploggingData;
  });
}

export default class PopupView extends Backbone.View {
  private options: PopupViewOptions;
  private ctx: { apiUrl: string };
  private site: Site;
  private dataTab: DataTab;
  private photosTab: PhotosTab;
  private speciesTab: SpeciesTab;
  private historyTab: HistoryTab;
  private waterActionTab: WaterActionTab;
  private visitsData: VisitData[];

  constructor(options: PopupViewOptions) {
    super();
    this.options = options;
    this.ctx = options.ctx;
    this.site = options.site;
  }

  render(): this {
    this.$el.html(PopupViewTemplate({ site: this.site }));

    this.dataTab = new DataTab(this.$el.find("#dataSection"));
    this.photosTab = new PhotosTab(this.$el.find("#photosSection"));
    this.speciesTab = new SpeciesTab(this.$el.find("#speciesSection"));
    this.historyTab = new HistoryTab(this.$el.find("#historySection"));
    this.waterActionTab = new WaterActionTab(this.$el.find("#waterActionSection"));

    // Only create the visual for a tab when required
    this.historyTab.show();
    this.$el.find("#speciesTab").on('show.bs.tab', () => {
      this.speciesTab.show();
    });
    this.$el.find("#photosTab").on('show.bs.tab', () => {
      this.photosTab.show();
    });
    this.$el.find("#historyTab").on('show.bs.tab', () => {
      this.historyTab.show();
    });
    this.$el.find("#waterActionTab").on('show.bs.tab', () => {
      this.waterActionTab.show();
    });

    // Show site photo
    if (this.site.photo) {
      if (this.$el.find("#image").html() === "") {
        const thumbnail = `<img height='100' class='thumb' src='${this.ctx.apiUrl}images/${this.site.photo.id}?h=100' >`;
        this.$el.find("#image").html(thumbnail);
      }
    }

    // Get the visits data
    const siteId = this.site._id;
    const formId = 'd1c360082dfc46b9bb1fd0ff582d6c06';
    const entityQuestionId = 'ee96dc4554b2431d8a2d7a8b418c23f8';

    const responseFilter = `{"form":"${formId}","data.${entityQuestionId}.value":"${siteId}"}`;
    const fullPath = this.ctx.apiUrl + "responses?filter=" + responseFilter;

    const ploggingFormId = '3203d0e5b2ec47418fc7a37466dff7ba';
    const ploggingEntityQuestionId = '3f7902a73e4a4f908be0bf17368f9afa';

    const ploggingResponseFilter = `{"form":"${ploggingFormId}","data.${ploggingEntityQuestionId}.value.code":"${this.site.code}"}`;
    const ploggingFullPath = this.ctx.apiUrl + "responses?filter=" + ploggingResponseFilter;

    $.getJSON(fullPath, (responses: Response[]) => {
      $.getJSON(ploggingFullPath, (ploggingResponses: Response[]) => {
        // Sort responses
        responses = _.sortBy(responses, r => r.submittedOn);
        const visitsData = createVisitsData(responses);

        ploggingResponses = _.sortBy(ploggingResponses, r => r.submittedOn);
        const ploggingData = createWaterActionData(ploggingResponses, ploggingFields);

        this.waterActionTab.setVisitsData({
          plogging: ploggingData,
        });

        const photoData: PhotoData[] = [];
        this.visitsData = visitsData;

        for (const visitData of this.visitsData) {
          if (visitData.photos?.length) {
            const photoIds: string[] = [];
            for (const photo of visitData.photos) {
              photoIds.push(photo.id);
              photoData.push({
                photoIds,
                date: visitData.date.length <= 10
                  ? moment(visitData.date, moment.ISO_8601).format("ll")
                  : moment(visitData.date, moment.ISO_8601).format("lll")
              });
            }
          }
        }

        for (const fData of ploggingData) {
          if (fData.before_image?.length) {
            const photoIds: string[] = [];
            for (const photo of fData.before_image) {
              photoIds.push(photo.id);
              photoData.push({
                photoIds,
                date: fData.date.length <= 10
                  ? moment(fData.date, moment.ISO_8601).format("ll")
                  : moment(fData.date, moment.ISO_8601).format("lll")
              });
            }
          }
          if (fData.after_image?.length) {
            const photoIds: string[] = [];
            for (const photo of fData.after_image) {
              photoIds.push(photo.id);
              photoData.push({
                photoIds,
                date: fData.date.length <= 10
                  ? moment(fData.date, moment.ISO_8601).format("ll")
                  : moment(fData.date, moment.ISO_8601).format("lll")
              });
            }
          }
        }

        this.dataTab.setVisitsData(visitsData);
        this.photosTab.setVisitsData(photoData);
        this.speciesTab.setVisitsData(visitsData);
        this.historyTab.setVisitsData(visitsData);
      });
    });

    return this;
  }
} 