Tab = require('./Tab')

module.exports = class DataTab extends Tab
  constructor: (content) ->
    super(content)

  initialize: ->
    @content.html(require("./DataTab.hbs"))
    @content.find("#selector").on 'change', (e) =>
      selected = $('#selector option').filter(':selected').text()
      @renderLineChart(selected)

    @renderLineChart('Turbidity')

  renderLineChart: (type) ->
    ctx = @content.find("#dataChart").get(0).getContext("2d");

    if type.toLowerCase() == 'turbidity'
      data = {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [
          {
            label: "My First dataset",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [65, 59, 80, 81, 56, 55, 40]
          },
        ]
      }
    else
      data = {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [
          {
            label: "My Second dataset",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: [28, 48, 40, 19, 86, 27, 90]
          }
        ]
      }

    myLineChart = new Chart(ctx).Line(data)