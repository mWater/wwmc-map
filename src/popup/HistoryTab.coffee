Tab = require('./Tab')
unitToString = require('./../unit').unitToString
moment = require 'moment'

module.exports = class HistoryTab extends Tab
  constructor: (content) ->
    super(content)

  initialize: ->
    data = []
    hasNitrite = false
    hasNitrate = false
    hasPhosphate = false
    for visitData in @visitsData.reverse()
      measures = {
        date: if visitData.date.length <= 10 then moment(visitData.date, moment.ISO_8601).format("ll") else moment(visitData.date, moment.ISO_8601).format("lll")
      }

      if visitData.ph?
        measures["ph"] = visitData.ph

      if visitData.turbidity?.quantity?
        measures["turbidity"] = visitData.turbidity.quantity + " " + unitToString("turbidity", visitData.turbidity.units)

      if visitData.water_temperature?.quantity?
        measures["waterTemperature"] = visitData.water_temperature.quantity + " " + unitToString("water_temperature", visitData.water_temperature.units)

      if visitData.dissolved_oxygen?.quantity?
        measures["dissolvedOxygen"] = visitData.dissolved_oxygen.quantity + " " + unitToString("dissolved_oxygen", visitData.dissolved_oxygen.units)

      if visitData.dissolved_oxygen_saturation?.quantity?
        measures["dissolvedOxygenSaturation"] = visitData.dissolved_oxygen_saturation.quantity + " " + unitToString("dissolved_oxygen_saturation", visitData.dissolved_oxygen_saturation.units)

      if visitData.nitrite?.quantity?
        hasNitrite = true
        measures["nitrite"] = visitData.nitrite.quantity + " " + unitToString("nitrite", visitData.nitrite.units)

      if visitData.nitrate?.quantity?
        hasNitrate = true
        measures["nitrate"] = visitData.nitrate.quantity + " " + unitToString("nitrate", visitData.nitrate.units)

      if visitData.phosphate?.quantity?
        hasPhosphate = true
        measures["phosphate"] = visitData.phosphate.quantity + " " + unitToString("phosphate", visitData.phosphate.units)

      data.push(measures)

    for d in data
      d.hasPhosphate = hasPhosphate
      d.hasNitrate = hasNitrate
      d.hasNitrite = hasNitrite

    @content.html(require("./HistoryTab.hbs")({
      data:data, hasNoData: data.length == 0,
      hasNitrite: hasNitrite, hasNitrate: hasNitrate, hasPhosphate: hasPhosphate
    }))