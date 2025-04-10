import Tab from './Tab';
import moment from 'moment';
import SpeciesTabTemplate from './SpeciesTab.hbs';

interface SpeciesData {
  date: string;
  caddisflies: boolean;
  dobsonflies: boolean;
  mayflies: boolean;
  stoneflies: boolean;
  craneflies: boolean;
  dragonflies: boolean;
  scuds: boolean;
  leeches: boolean;
  midges: boolean;
  pounchsnails: boolean;
  tubiflexworms: boolean;
}

interface VisitData {
  macroinvertebrate_data_available: boolean;
  date: string;
  caddisflies_present: boolean;
  dobsonflies_present: boolean;
  mayflies_present: boolean;
  stoneflies_present: boolean;
  craneflies_present: boolean;
  dragonflies_present: boolean;
  scuds_present: boolean;
  leeches_present: boolean;
  midges_present: boolean;
  pounch_snails_present: boolean;
  tubiflex_worms_present: boolean;
}

export default class SpeciesTab extends Tab {
  constructor(content: JQuery) {
    super(content);
  }

  protected initialize(): void {
    const data: SpeciesData[] = [];
    
    for (const visitData of this.visitsData as VisitData[]) {
      if (visitData.macroinvertebrate_data_available) {
        data.push({
          date: moment(visitData.date, moment.ISO_8601).format("ll"),
          caddisflies: visitData.caddisflies_present,
          dobsonflies: visitData.dobsonflies_present,
          mayflies: visitData.mayflies_present,
          stoneflies: visitData.stoneflies_present,
          craneflies: visitData.craneflies_present,
          dragonflies: visitData.dragonflies_present,
          scuds: visitData.scuds_present,
          leeches: visitData.leeches_present,
          midges: visitData.midges_present,
          pounchsnails: visitData.pounch_snails_present,
          tubiflexworms: visitData.tubiflex_worms_present
        });
      }
    }

    this.content.html(SpeciesTabTemplate({
      data,
      hasNoData: data.length === 0
    }));
  }
} 