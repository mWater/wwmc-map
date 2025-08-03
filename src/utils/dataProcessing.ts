// Purely hardcoded fields from the form data
// The form cannot change or this will be wrong
const questionAndFields = [
  {questionId: 'efb614336f504f31a312581e2283a8b2', field: 'date'},
  
  {questionId: 'f4725a40f1474bd6a9c16df63865e1d8', field: 'turbidity'},
  {questionId: 'd5cf3fc485164dd5b9ef0edbaacfdeac', field: 'water_temperature'},
  {questionId: '446ad384f0d64fc9baf2b810c5fba2ac', field: 'dissolved_oxygen'},
  {questionId: 'ea33bee55ce24dc1a2eaab2c5a6e679b', field: 'dissolved_oxygen_saturation'},
  {questionId: 'e05e0afdff824cf3bbc3aefcfadc96ee', field: 'ph'},
  
  {questionId: 'd03de1a11d324de5b3b1d197f24c1519', field: 'nitrate'},
  {questionId: 'ec09f13bc97a433ba8f89c1c34273a9f', field: 'nitrite'},
  {questionId: 'eff5e181612541f9b04b33d39a17715d', field: 'phosphate'},
  {questionId: 'd28f9ed8ac2445f9900e6cb231d136d9', field: 'photos'},
  
  {questionId: 'f146785697ac4d29821a6969e909ee20', choiceId: 'He4yspy', field: 'macroinvertebrate_data_available', multi: false},
  
  {questionId: 'f02ec505ef114deca7e7735247b7821b', choiceId: '8R5P9ST', field: 'caddisflies', multi: true},
  {questionId: 'f02ec505ef114deca7e7735247b7821b', choiceId: 'dbBRlKD', field: 'dobsonflies', multi: true},
  {questionId: 'f02ec505ef114deca7e7735247b7821b', choiceId: '7ZU8Yjg', field: 'mayflies', multi: true},
  {questionId: 'f02ec505ef114deca7e7735247b7821b', choiceId: '9QfVGsF', field: 'stoneflies', multi: true},
  {questionId: 'fc27a75ece87477aa59f0193b8afd4ce', choiceId: 'kkEEkks', field: 'craneflies', multi: true},
  {questionId: 'fc27a75ece87477aa59f0193b8afd4ce', choiceId: 'h7yvJDd', field: 'dragonflies', multi: true},
  {questionId: 'fc27a75ece87477aa59f0193b8afd4ce', choiceId: 'Rx7u6Tp', field: 'scuds', multi: true},
  {questionId: 'ce3c95486d214836823d030386a64e50', choiceId: 'h7yvJDd', field: 'leeches', multi: true},
  {questionId: 'ce3c95486d214836823d030386a64e50', choiceId: 'Rx7u6Tp', field: 'midges', multi: true},
  {questionId: 'ce3c95486d214836823d030386a64e50', choiceId: 'AK3NYkv', field: 'pounchsnails', multi: true},
  {questionId: 'ce3c95486d214836823d030386a64e50', choiceId: 'qxmSzcj', field: 'tubiflexworms', multi: true}
];

const ploggingFields = [
  {questionId: '9e40eb8f50c8417bb0338c884f3916a1', field: 'date'},
  {questionId: '1f4481c41936423fb957cb705c464211', field: 'participants'},
  {questionId: '9085b1fa84fe4aefb94bd8961ecb124b', field: 'duration'},
  {questionId: '180c81c0d6ae4fa2958dacc8a03972d8', field: 'distance'},
  {questionId: '07f214b201ff439799b64bf2be51d53d', field: 'pieces_collected'},
  {questionId: '2b6235f00fd24ebfba827a3a5cf14211', field: 'bags_used'},
  {questionId: '619ed15f7a4e44bfbcc0bf5fc71fe98e', field: 'total_weight'},
  
  {questionId: '5ce187b6fa8b484a9aacf4e10fc7db4c', field: 'before_image'},
  {questionId: '2c3c478fd2ce42a3b269a069191ec83f', field: 'after_image'}
];

interface QuestionField {
  questionId: string;
  field: string;
  choiceId?: string;
  multi?: boolean;
}

// Extract the data from the response and put it in the old format
export const createVisitsData = (responses: any[]): any[] => {
  return responses.map((response) => {
    const visitData: any = {};
    
    for (const questionAndField of questionAndFields) {
      const answer = response.data[questionAndField.questionId];
      
      // If the answer exists
      if (answer?.value != null) {
        // And it's a choice
        if (questionAndField.choiceId) {
          // And there can be multiple values
          if (questionAndField.multi) {
            // We check if the choiceId is part of the value
            visitData[questionAndField.field] = answer.value.indexOf(questionAndField.choiceId) >= 0;
          } else {
            // We check if the choiceId is equal to the value
            visitData[questionAndField.field] = answer.value === questionAndField.choiceId;
          }
        } else {
          // We simply assign the value (good for all measures)
          visitData[questionAndField.field] = answer.value;
        }
      }
    }
    
    return visitData;
  });
};

export const createWaterActionData = (responses: any[], fields: QuestionField[]): any[] => {
  return responses.map((response) => {
    const actionData: any = {};
    
    for (const field of fields) {
      const answer = response.data[field.questionId];
      
      // If the answer exists
      if (answer?.value != null) {
        // And it's a choice
        if (field.choiceId) {
          // And there can be multiple values
          if (field.multi) {
            // We check if the choiceId is part of the value
            actionData[field.field] = answer.value.indexOf(field.choiceId) >= 0;
          } else {
            // We check if the choiceId is equal to the value
            actionData[field.field] = answer.value === field.choiceId;
          }
        } else {
          // We simply assign the value (good for all measures)
          actionData[field.field] = answer.value;
        }
      }
    }
    
    return actionData;
  });
};

export { ploggingFields };