import { surveyQuestions } from './surveySchema';
import { measurementQuestions } from './dataProcessing';

// Unit IDs are scoped to their question: nitrate/nitrite labels must not collide.
export const unitToString = (measure: string, unit?: string): string => {
  if (!unit) return '';
  return surveyQuestions[measurementQuestions[measure]]?.units?.[unit] || '(unrecognized unit)';
};
