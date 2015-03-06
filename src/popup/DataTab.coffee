Tab = require('./Tab')

module.exports = class DataTab extends Tab
  constructor: (content) ->
    super(content)

  initialize: ->
    @content.html(require("./DataTab.hbs"))
    @content.find("#selector").on 'change', (e) =>
      selected = $('#selector option').filter(':selected')[0].value
      @renderLineChart(selected)

    @renderLineChart('ph')

  renderLineChart: (type) ->
    ctx = @content.find("#dataChart").get(0).getContext("2d");

    options = {
      label: "My Second dataset",
      fillColor: "rgba(151,187,205,0.2)",
      strokeColor: "rgba(151,187,205,1)",
      pointColor: "rgba(151,187,205,1)",
      pointStrokeColor: "#fff",
      pointHighlightFill: "#fff",
      pointHighlightStroke: "rgba(151,187,205,1)",
      data: [28, 48, 40, 19, 86, 27, 90]
    }

    if type == 'ph'
      options["label"] = "pH"
      options["data"] = [65, 59, 80, 81, 56, 55, 40]
      datasets = []
      datasets[0] = options
      data = {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: datasets
      }
    else if type == 'water_temperature'
      options["label"] = "Water Temperature"
      options["data"] = [28, 48, 40, 19, 86, 27, 90]
      datasets = []
      datasets[0] = options
      data = {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: datasets
      }
    else if type == 'dissolved_oxygen'
      options["label"] = "Dissolved Oxygen"
      options["data"] = [28, 48, 40, 19, 86, 27, 90]
      datasets = []
      datasets[0] = options
      data = {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: datasets
      }

    myLineChart = new Chart(ctx).Line(data)