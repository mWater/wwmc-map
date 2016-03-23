Tab = require('./Tab')
unitToString = require('./../unit').unitToString

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
        date: visitData.date,
      }

      if visitData.ph?
        measures["ph"] = visitData.ph

      if visitData.turbidity?
        measures["turbidity"] = visitData.turbidity.quantity + " " + unitToString("turbidity", visitData.turbidity.units)

      if visitData.water_temperature?
        measures["waterTemperature"] = visitData.water_temperature.quantity + " " + unitToString("water_temperature", visitData.water_temperature.units)

      if visitData.dissolved_oxygen?
        measures["dissolvedOxygen"] = visitData.dissolved_oxygen.quantity + " " + unitToString("dissolved_oxygen", visitData.dissolved_oxygen.units)

      if visitData.nitrite?
        hasNitrite = true
        measures["nitrite"] = visitData.nitrite.quantity + " " + unitToString("nitrite", visitData.nitrite.units)

      if visitData.nitrate?
        hasNitrate = true
        measures["nitrate"] = visitData.nitrate.quantity + " " + unitToString("nitrate", visitData.nitrate.units)

      if visitData.phosphate?
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