Tab = require('./Tab')
unitToString = require('./../unit').unitToString
moment = require 'moment'

durations = [
  {"id":"eJzaU1w","label":{"en":"5 minutes","_base":"en"}},
  {"id":"dBF76uD","label":{"en":"15 minutes","_base":"en"}},
  {"id":"sekt45H","label":{"en":"30 minutes","_base":"en"}},
  {"id":"jlCLQTQ","label":{"en":"1+ hour","_base":"en"}}
]

posterOptions = [
  { "id": "4gEt9hY","label": {"en": "Yes","_base": "en"}},
  { "id": "sxRjm6r", "label": {"en": "No","_base": "en"}}
]

affiliations = [
  { "id": "vbvSy2S", "label": { "en": "School", "_base": "en" }},
  { "id": "CdbSvWD", "label": { "en": "Organization", "_base": "en"}},
  { "id": "vShkZmm", "label": { "en": "Group name", "_base": "en" }},
  { "id": "78q4BkC", "label": { "en": "None", "_base": "en" }}
]

module.exports = class PloggingTab extends Tab
  constructor: (content) ->
    super(content)

  initialize: ->
    @content.html(require("./WaterActionTab.hbs")())

    @subContent = @content.find("#subContent")

    @content.find("#waterActionSelector").on 'change', (e) =>
      selected = $('#waterActionSelector option').filter(':selected')[0].value
      @render(selected)

    @render('plogging')

  render: (type) ->
    if type == "plogging"
      data = []
      for visitData in @visitsData["plogging"].reverse()

        measures = {
          date: if visitData.date.length <= 10 then moment(visitData.date, moment.ISO_8601).format("ll") else moment(visitData.date, moment.ISO_8601).format("lll")
        }

        if visitData.pieces_collected?
          measures["pieces_collected"] = visitData.pieces_collected
        
        if visitData.participants?
          measures["participants"] = visitData.participants
        
        if visitData.duration?
          measures["duration"] = durations.filter((d) -> d.id == visitData.duration)[0].label.en
        
        if visitData.bags_used?
          measures["bags_used"] = visitData.bags_used

        if visitData.distance?.quantity?
          measures["distance"] = visitData.distance.quantity + " " + unitToString("distance", visitData.distance.units)
        
        if visitData.total_weight?.quantity?
          measures["total_weight"] = visitData.total_weight.quantity + " " + unitToString("total_weight", visitData.total_weight.units)
        data.push(measures)

      @subContent.html(require("./PloggingTable.hbs")({
        data:data, hasNoData: data.length == 0,
      }))
    if type == "flushing"
      data = []
      if @visitsData["flushing"]
        for visitData in @visitsData["flushing"].reverse()

          measures = {
            date: if visitData.date.length <= 10 then moment(visitData.date, moment.ISO_8601).format("ll") else moment(visitData.date, moment.ISO_8601).format("lll")
          }

          if visitData.affiliation?
            measures["affiliation"] = affiliations.filter((d) -> d.id == visitData.affiliation)[0].label.en
          
          if visitData.participants?
            measures["participants"] = visitData.participants
          
          if visitData.affiliation_name?
            measures["affiliation_name"] = visitData.affiliation_name
          
          if visitData.poster?
            measures["poster"] = posterOptions.filter((d) -> d.id == visitData.poster)[0].label.en

          # if visitData.distance?.quantity?
          #   measures["distance"] = visitData.distance.quantity + " " + unitToString("distance", visitData.distance.units)
          
          # if visitData.total_weight?.quantity?
          #   measures["total_weight"] = visitData.total_weight.quantity + " " + unitToString("total_weight", visitData.total_weight.units)
          data.push(measures)

      @subContent.html(require("./FlushingTable.hbs")({
        data:data, hasNoData: data.length == 0,
      }))