import { DATE, responseDate } from './consolidatedSurvey';

export const measurementQuestions: Record<string, string> = {
  date: DATE,
  turbidity: '00343d56f85e4a49ab8e67b4edf316cd',
  water_temperature: 'acf0fb6f0c4945bf900e7f7f4c71044a',
  dissolved_oxygen: 'c12d9aa9037d412083130df5dc8a4851',
  dissolved_oxygen_saturation: '65995522097542f3bf2e2c133c6dc42e',
  ph: '50ae8dd5aa374c1d97c5fdf21c6767f1',
  nitrate: '7d1b9c62db4042cea225648b853f5607',
  nitrite: '9a4b649b3161466eacd97b97fbdec637',
  phosphate: '242432d697a54665ac00edf8e5f1d9b5'
};
const speciesGroups = [
  ['c4145933594840f7ba264539a5bacd6a', {caddisflies:'ZsU63Ay',dobsonflies:'QL3REFX',mayflies:'6Llg1Gh',stoneflies:'HkS17rS'}],
  ['dfb89ef0fddf435db80dbb2e100ab96f', {craneflies:'DdjbKDk',dragonflies:'H8KT8BS',scuds:'8C9yUHu',crayfish:'WwSBD7Y'}],
  ['6439b1b3373b4c56804e0871bb295261', {leeches:'1LftkTS',midges:'9nnf9LR',pouchsnails:'dncXBUG',tubiflexworms:'51cnCnP',snails:'UTPlAd6'}]
] as const;
export function createVisitsData(responses: any[]): any[] {
  return responses.map(response => {
    const data = response.data || {};
    const visit: any = Object.fromEntries(Object.entries(measurementQuestions).map(([field,id]) => [field,data[id]?.value]));
    visit.date = responseDate(response);
    visit.macroinvertebrate_data_available = data['21e1fd35bc284c698778ed8fc79770a8']?.value === 'U91h9MZ';
    for (const [question, species] of speciesGroups) {
      const observed = data[question]?.value;
      for (const [field, choice] of Object.entries(species)) visit[field] = Array.isArray(observed) ? observed.includes(choice) : undefined;
    }
    return visit;
  }).sort((a,b) => a.date.localeCompare(b.date));
}
