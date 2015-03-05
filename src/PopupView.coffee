
module.exports = class PopupView extends Backbone.View
  constructor: (options) ->
    super()
    @options = options
    @ctx = options.ctx
    @site = options.site

  render: ->
    @$el.html(require("./PopupView.hbs")(site: @site))
    #@renderLineChart()

    @dataTab = @$el.find("#dataTab")
    @speciesTab = @$el.find("#speciesTab")
    @photosTab = @$el.find("#photosTab")
    @historyTab = @$el.find("#historyTab")

    @dataContent = @$el.find("#dataSection")
    @speciesContent = @$el.find("#speciesSection")
    @photosContent = @$el.find("#photosSection")
    @historyContent = @$el.find("#historySection")

    @dataInitialized = false
    @speciesInitialized = false
    @photosInitialized = false
    @hitoryInitialized = false

    @initializeData()
    @speciesTab.on('show.bs.tab', (e) =>
      @initializeSpecies()
    )
    @photosTab.on('show.bs.tab', (e) =>
      @initializePhotos()
    )
    @historyTab.on('show.bs.tab', (e) =>
      @initializeHistory()
    )

    console.log @site
    if @site.photos
      cover = _.findWhere(@site.photos, { cover: true })
      if cover and @$el.find("#image").html() == ""
        thumbnail = "<img class='thumb' src='#{this.ctx.apiUrl}images/" + cover.id + "?h=100' >"
        @$el.find("#image").html(thumbnail)

    this

  initializeData: ->
    if not @dataInitialized
      @dataInitialized = true

      @dataContent.html(require("./DataTab.hbs"))
      @dataContent.find("#selector").on 'change', (e) =>
        selected = $('#selector option').filter(':selected').text()
        @renderLineChart(selected)

      @renderLineChart('Turbidity')

  initializeSpecies: ->
    if not @speciesInitialized
      @speciesInitialized = true

      @speciesContent.html(require("./SpeciesTab.hbs"))

  initializePhotos: ->
    if not @photosInitialized
      @photosInitialized = true

      @photosContent.html(require("./PhotosTab.hbs"))

  initializeHistory: ->
    if not @hitoryInitialized
      @hitoryInitialized = true

      @historyContent.html(require("./HistoryTab.hbs"))


  renderLineChart: (type) ->
    ctx = @$el.find("#dataChart").get(0).getContext("2d");

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
