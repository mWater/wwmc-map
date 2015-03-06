unitToString = require('./../unit').unitToString
DataTab = require('./DataTab')
SpeciesTab = require('./SpeciesTab')
PhotosTab = require('./PhotosTab')
HistoryTab = require('./HistoryTab')

module.exports = class PopupView extends Backbone.View
  constructor: (options) ->
    super()
    @options = options
    @ctx = options.ctx
    @site = options.site

  render: ->
    @$el.html(require("./PopupView.hbs")(site: @site))

    @dataTab = new DataTab(@$el.find("#dataSection"))
    @photosTab = new PhotosTab(@$el.find("#photosSection"))
    @speciesTab = new SpeciesTab(@$el.find("#speciesSection"))
    @historyTab = new HistoryTab(@$el.find("#historySection"))

    #Only create the visual for a tab when required
    @dataTab.show()
    @$el.find("#speciesTab").on('show.bs.tab', (e) =>
      @speciesTab.show()
    )
    @$el.find("#photosTab").on('show.bs.tab', (e) =>
      @photosTab.show()
    )
    @$el.find("#historyTab").on('show.bs.tab', (e) =>
      @historyTab.show()
    )

    # Show site photo
    if @site.photo
      if @$el.find("#image").html() == ""
        thumbnail = "<img class='thumb' src='#{this.ctx.apiUrl}images/" + @site.photo.id + "?h=100' >"
        @$el.find("#image").html(thumbnail)

    # Get the visits data
    siteId = @site._id
    filter = "{\"type\":\"wwmc_visit\",\"site\":\"#{siteId}\"}"
    fullPath = @ctx.apiUrl + "entities?filter=#{filter}"
    $.getJSON fullPath, (visitsData) =>
      visitsData = _.sortBy(visitsData, "date")
      @visitsData = visitsData
      @dataTab.setVisitsData(visitsData)
      @photosTab.setVisitsData(visitsData)
      @speciesTab.setVisitsData(visitsData)
      @historyTab.setVisitsData(visitsData)

    this
