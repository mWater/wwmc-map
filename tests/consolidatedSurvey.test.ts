import assert from 'node:assert/strict';
import { FORM, SITE, ACTIVITY, DATE, WATER_QUALITY, activities, siteResponseFilter, createActions, actionDetails, formatAnswer } from '../src/utils/consolidatedSurvey';
import { createVisitsData } from '../src/utils/dataProcessing';
import { unitToString } from '../src/utils/unit';
import { surveyQuestions } from '../src/utils/surveySchema';

assert.throws(() => siteResponseFilter(''), /Site code/);
assert.deepEqual(siteResponseFilter('5267835'), {form:FORM,status:'final',[`data.${SITE}.value.code`]:'5267835'});
const response = {_id:'test',submittedOn:'2020-05-01',data:{
 [ACTIVITY]:{value:[WATER_QUALITY,'edHnNYr','edHnNYr','ta3XKZX']},
 [DATE]:{value:'2019-06-02'},
 fecc34e5a3494148acced42e93e9ef68:{value:0},
 '50ae8dd5aa374c1d97c5fdf21c6767f1':{value:0},
 '21e1fd35bc284c698778ed8fc79770a8':{value:'U91h9MZ'},
 dfb89ef0fddf435db80dbb2e100ab96f:{value:['WwSBD7Y']},
 '7549015f12f04060b2dd0502de0353da':{value:{'8THC7la':{
  aa46b6181d714840ac6e7cc22bfab317:{value:0},
  '25f3e7091ab14176952b58435373c210':{value:{quantity:12.5,units:'nY9GVPr'}}
 }}},
 '6147e2579a5d5f1183929a7d34ad07df':{value:['two, separate words','second item']}
}};
assert.equal(activities(response).length,3);
const actions=createActions([response]);
assert.equal(actions.length,2,'Mixed activities yield one row per selected action, not duplicate surveys');
assert.equal(actions[0].participants,0);
assert.equal(actions[0].date,'2019-06-02');
const details=actionDetails(actions.find(a=>a.action_type==='edHnNYr'));
assert.ok(details.some(d=>d.value.includes('Total pieces of waste collected: 0')));
assert.ok(details.some(d=>d.value.includes('12.5 kilograms')));
assert.ok(details.some(d=>d.value==='two, separate words\nsecond item'));
const visit=createVisitsData([response])[0];
assert.equal(visit.ph,0);assert.equal(visit.crayfish,true);assert.equal(visit.dragonflies,false);
for(const [measure,id] of [['nitrate','7d1b9c62db4042cea225648b853f5607'],['nitrite','9a4b649b3161466eacd97b97fbdec637']]) {
 for(const [unit,label] of Object.entries(surveyQuestions[id].units)) assert.equal(unitToString(measure,unit),label);
}
assert.equal(formatAnswer({type:'TextQuestion'},{confidential:true,value:'private'}),'');
assert.equal(createVisitsData([{data:{}}])[0].date,'');
console.log('PASS: Site code and finalized filter; mixed activities; exact units; zero values; lists; species; confidential values omitted');
