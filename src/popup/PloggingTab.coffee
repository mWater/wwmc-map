Tab = require('./Tab')
unitToString = require('./../unit').unitToString
moment = require 'moment'

durations = [
  {"id":"eJzaU1w","label":{"en":"5 minutes","_base":"en"}},
  {"id":"dBF76uD","label":{"en":"15 minutes","_base":"en"}},
  {"id":"sekt45H","label":{"en":"30 minutes","_base":"en"}},
  {"id":"jlCLQTQ","label":{"en":"1+ hour","_base":"en"}}
]

module.exports = class PloggingTab extends Tab
  constructor: (content) ->
    super(content)

  initialize: ->
    data = []
    for visitData in @visitsData.reverse()

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
    # console.log(measures)
    @content.html(require("./PloggingTab.hbs")({
      data:data, hasNoData: data.length == 0,
    }))