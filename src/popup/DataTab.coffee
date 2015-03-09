Tab = require('./Tab')
unitToString = require('./../unit').unitToString

module.exports = class DataTab extends Tab
  constructor: (content) ->
    super(content)

  initialize: ->
    @data = []

    for visitData in @visitsData
      measures = {
        date: visitData.date
      }

      if visitData.ph?
        measures["ph"] = visitData.ph

      if visitData.turbidity?
        measures["turbidity"] = visitData.turbidity.magnitude
        measures["turbidityUnit"] = visitData.turbidity.unit

      if visitData.water_temperature?
        measures["waterTemperature"] = visitData.water_temperature.magnitude
        measures["waterTemperatureUnit"] = visitData.water_temperature.unit

      if visitData.dissolved_oxygen?
        measures["dissolvedOxygen"] = visitData.dissolved_oxygen.magnitude
        measures["dissolvedOxygenUnit"] = visitData.dissolved_oxygen.unit

      @data.push(measures)

    @content.html(require("./DataTab.hbs")())

    @subContent = @content.find("#subContent")

    @content.find("#selector").on 'change', (e) =>
      selected = $('#selector option').filter(':selected')[0].value
      @render(selected)

    @render('ph')

  render: (type) ->
    values = []
    if type == "ph"
      for value in @data
        if value.ph?
          values.push({date: value.date, value: value.ph, valueWithUnit: value.ph})
    else if type == "water_temperature"
      for value in @data
        if value.waterTemperature?
          valueWithUnit = value.waterTemperature + " " + unitToString(type, value.waterTemperatureUnit)
          values.push({date: value.date, value: value.waterTemperature, valueWithUnit: valueWithUnit})
    else if type == "dissolved_oxygen"
      for value in @data
        if value.dissolvedOxygen?
          valueWithUnit = value.dissolvedOxygen + " " + unitToString(type, value.dissolvedOxygenUnit)
          values.push({date: value.date, value: value.dissolvedOxygen, valueWithUnit: valueWithUnit})

    if values.length == 0
      @subContent.html("No data")
    else if values.length == 1
      value = values[0]
      @subContent.html(require("./DataSubTab.hbs")({date: value.date, singleValue: value.valueWithUnit}))
    else if values.length == 2
      newValue = values[1]
      oldValue = values[0]
      @subContent.html(require("./DataSubTab.hbs")({
        newValue: newValue.valueWithUnit,
        newDate: newValue.date,
        oldValue: oldValue.valueWithUnit,
        oldDate: oldValue.date
      }))
    else
      if values.length <= 20
        graphWidth = 400
        graphHeight = 225
      else
        graphWidth = 400 + (values.length - 20) * 20
        graphHeight = 200
      @subContent.html(require("./DataSubTab.hbs")({drawGraph: true, graphWidth: graphWidth, graphHeight: graphHeight}))
      @renderLineChart(type, values);

  renderLineChart: (type, values) ->
    ctx = @subContent.find("#dataChart").get(0).getContext("2d");

    options = {
      fillColor: "rgba(151,187,205,0.2)",
      strokeColor: "rgba(151,187,205,1)",
      pointColor: "rgba(151,187,205,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(151,187,205,1)",
      data: _.pluck(values, "value")
    }

    if type == 'ph'
      options["label"] = "pH"
    else if type == 'water_temperature'
      options["label"] = "Water Temperature"
    else if type == 'dissolved_oxygen'
      options["label"] = "Dissolved Oxygen"

    datasets = [options]
    data = {
      labels: _.pluck(values, "date"),
      datasets: datasets
    }

    myLineChart = new Chart(ctx).Line(data, {pointDot: true, pointHitDetectionRadius: 2})