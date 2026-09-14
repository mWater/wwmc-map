import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import PopupView from '../src/components/popup/PopupView';
const responses = [{_id:'preview',submittedOn:'2020-05-01',data:{
 '5be63e7858bd4097912cdc2cf92d3429':{value:['fqud6M9','edHnNYr','ta3XKZX']},
 b74fc16dcdb844a7b0ea919324546faf:{value:'2019-06-02'},
 fecc34e5a3494148acced42e93e9ef68:{value:0},
 '50ae8dd5aa374c1d97c5fdf21c6767f1':{value:0},
 acf0fb6f0c4945bf900e7f7f4c71044a:{value:{quantity:18,units:'W1N6Yjv'}},
 '21e1fd35bc284c698778ed8fc79770a8':{value:'U91h9MZ'},
 dfb89ef0fddf435db80dbb2e100ab96f:{value:['WwSBD7Y']},
 '7549015f12f04060b2dd0502de0353da':{value:{'8THC7la':{aa46b6181d714840ac6e7cc22bfab317:{value:0},'25f3e7091ab14176952b58435373c210':{value:{quantity:12.5,units:'nY9GVPr'}}}}},
 '6147e2579a5d5f1183929a7d34ad07df':{value:['two, separate words','second item']}
}}];
const realFetch=window.fetch.bind(window);
window.fetch=(input,init) => String(input).startsWith('/migration-fixture/') ? Promise.resolve(new Response(JSON.stringify(responses),{headers:{'Content-Type':'application/json'}})) : realFetch(input,init);
createRoot(document.getElementById('root')!).render(<PopupView ctx={{apiUrl:'/migration-fixture/'}} site={{_id:'preview',code:'5267835',name:'Migration Preview Site',surface_water_type:'River',location:{coordinates:[0,0]}}} />);
