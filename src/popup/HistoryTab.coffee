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
        measures["turbidity"] = visitData.turbidity.magnitude + " " + unitToString("turbidity", visitData.turbidity.unit)

      if visitData.water_temperature?
        measures["waterTemperature"] = visitData.water_temperature.magnitude + " " + unitToString("water_temperature", visitData.water_temperature.unit)

      if visitData.dissolved_oxygen?
        measures["dissolvedOxygen"] = visitData.dissolved_oxygen.magnitude + " " + unitToString("dissolved_oxygen", visitData.dissolved_oxygen.unit)

      if visitData.nitrite?
        hasNitrite = true
        measures["nitrite"] = visitData.nitrite.magnitude + " " + unitToString("nitrite", visitData.nitrite.unit)

      if visitData.nitrate?
        hasNitrate = true
        measures["nitrate"] = visitData.nitrate.magnitude + " " + unitToString("nitrate", visitData.nitrate.unit)

      if visitData.phosphate?
        hasPhosphate = true
        measures["phosphate"] = visitData.phosphate.magnitude + " " + unitToString("phosphate", visitData.phosphate.unit)

      data.push(measures)

    @content.html(require("./HistoryTab.hbs")({
      data:data, hasNoData: data.length == 0,
      hasNitrite: hasNitrite, hasNitrate: hasNitrate, hasPhosphate: hasPhosphate
    }))