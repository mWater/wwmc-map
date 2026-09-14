import { surveyQuestions } from './surveySchema';

export const FORM = '71c7f520f04f4d23b5f9d8e44f7e1355';
export const SITE = '74136a7958bd45eb8fa1d481946b622e';
export const ACTIVITY = '5be63e7858bd4097912cdc2cf92d3429';
export const DATE = 'b74fc16dcdb844a7b0ea919324546faf';
export const PARTICIPANTS = 'fecc34e5a3494148acced42e93e9ef68';
export const WATER_QUALITY = 'fqud6M9';
export const ACTION_LABELS: Record<string, string> = surveyQuestions[ACTIVITY].choices;
export const PHOTO_QUESTIONS = ['7fcb7e6740c14f4baadbdd90190eaee9', 'e6eaafc0408d49d4920a325351626952', '2581f776b19f4dabaf0ec673ccd3f023'];

export function activities(response: any): string[] {
  const value = response.data?.[ACTIVITY]?.value;
  return Array.isArray(value) ? [...new Set<string>(value)] : [];
}

export function siteResponseFilter(code: string) {
  if (!code) throw new Error('A Site code is required');
  return { form: FORM, status: 'final', [`data.${SITE}.value.code`]: code };
}

export function responseDate(response: any): string {
  return response.data?.[DATE]?.value || response.submittedOn || '';
}

// Activity-specific details plus common organization and remarks. All are normal
// public survey questions; confidential migration archives are never displayed.
const details: Record<string, string[]> = {
  edHnNYr: ['7bcbdee6f4b14ed288b46bb8209e0be8','8ba01a3ddb0d4139a489435e71edae36','7549015f12f04060b2dd0502de0353da','d343ec3c79e342f0926323219ba4eac9','6147e2579a5d5f1183929a7d34ad07df'],
  meHkyRp: ['8deeb96181a948bdbe6c22d0d7d91570','226cf31be16e4e13bc2980b893cb6c7e','f4425584b717409080980fc46e1bb30d','fa60695cac3044edacad5a147ca7263c','c678c29a652245cea152fe18dac41270'],
  ZzPq3d2: ['2467157e1bf94d279b4f2383981e85a4','1defbced700e41ae8f6eb7ae6770b15c','e330d937d50848deb5999234e512b6f9','667c4353b3424adb9de268f06b3fa152'],
  Zc19r9q: ['b0151860e58e4f10843a76f531b31268','3a6321270f70494cbde98eef2edacd43','d3f59379056440faa18c9f466cfc4583'],
  ASn7gND: ['a0e778afe23d41ce88548391ba86ff00'],
  ta3XKZX: ['13e806a68f86463b8d925c29530c8c26','0f891c09669e498196119aff635ac747'],
  W95d24G: ['c86d635645554ee7b73d06606d34b906']
};

export function formatAnswer(question: any, answer: any): string {
  const value = answer?.value;
  if (value == null || answer.confidential) return '';
  if (question.type === 'MatrixQuestion') {
    return Object.entries(value).flatMap(([rowId, row]: [string, any]) =>
      Object.entries(question.columns || {}).map(([id, column]: [string, any]) => {
        const formatted = formatAnswer(column, row[id]);
        return formatted ? [question.items?.[rowId], column.label, formatted].filter(Boolean).join(': ') : '';
      }).filter(Boolean)).join('\n');
  }
  if (question.type === 'UnitsQuestion' || question.type === 'UnitsColumnQuestion') {
    if (value.quantity == null) return '';
    return `${value.quantity} ${value.units ? question.units[value.units] || '(unrecognized unit)' : ''}`.trim();
  }
  if (question.choices) {
    return (Array.isArray(value) ? value : [value]).map(id =>
      [question.choices[id] || 'Unrecognized choice', answer.specify?.[id]].filter(Boolean).join(': ')).join('; ');
  }
  return Array.isArray(value) ? value.join('\n') : String(value);
}

export function actionDetails(action: any) {
  const ids = ['24db050eb2d9466eb603e03260a30f53', ...(details[action.action_type] || []), 'c0fe66aead114674beeda08dc27e7141'];
  return ids.map(id => ({label: surveyQuestions[id]?.label, value: formatAnswer(surveyQuestions[id], action.response.data?.[id])})).filter(item => item.value);
}

export function createActions(responses: any[]) {
  return responses.flatMap(response => activities(response).filter(id => id !== WATER_QUALITY && ACTION_LABELS[id]).map(id => ({
    date: responseDate(response), action_type: id, participants: response.data?.[PARTICIPANTS]?.value,
    label: [ACTION_LABELS[id], response.data?.[ACTIVITY]?.specify?.[id]].filter(Boolean).join(': '), response
  }))).sort((a,b) => b.date.localeCompare(a.date));
}
