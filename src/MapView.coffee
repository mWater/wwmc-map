
PopupView = require './popup/PopupView'

module.exports = class MapView 
  constructor: (options) ->
    @options = options
    @ctx = options.ctx
    @currentDisplayType = null
    @currentYearFilter = null

    @map = L.map(options.el, { zoomControl: false })
    @map.setView([37, -8], 3)
    
    # Add base layer
    @baseLayer = L.bingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", { type: "Road"})
    @map.addLayer(@baseLayer)

    @searchControl = new L.esri.Controls.Geosearch({position: 'topright'}).addTo(@map)

    # Add brand
    brand = L.control({position: 'topleft'})
    brand.onAdd = (map) ->
      html = '''
      <div class="map-brand">
        <a href="http://monitorwater.org" target="_blank">
          <img id="brand" src="img/brand.png" style="cursor: pointer;">
        </a>
      </div>
      '''
      return $(html).get(0)
    brand.addTo(@map)

    # Add zoom control
    L.control.zoom({ position: "bottomleft" }).addTo(@map)

    @addLegendControl()
    @addFilterControl()
    @fetchMap()

  createDataLayer: (displayType, yearFilter) ->
    if @currentDisplayType == displayType and @currentYearFilter == yearFilter
      return
    @currentDisplayType = displayType
    @currentYearFilter = yearFilter

    if @dataLayer
      @map.removeLayer(@dataLayer)
    if @gridLayer
      @map.removeLayer(@gridLayer)

    # Add data layer
    url = @ctx.tileUrl + "?type=wwmc_main&display=" + displayType
    if yearFilter != ""
      url += "&year=" + yearFilter
    @dataLayer = L.tileLayer(url)
    @dataLayer.setOpacity(0.8)

    # TODO hack for non-zoom animated tile layers
    @map._zoomAnimated = false
    @map.addLayer(@dataLayer)
    @map._zoomAnimated = true

    $(@dataLayer._container).addClass('leaflet-zoom-hide')

    # Add grid layer
    url = @ctx.gridUrl + "?type=wwmc_main&display=" + displayType
    if yearFilter != ""
      url += "&year=" + yearFilter
    @gridLayer = new L.UtfGrid(url, { useJsonP: false })
    @map.addLayer(@gridLayer)

    # Handle clicks
    @gridLayer.on 'click', (ev) =>
      if ev.data and ev.data.id
        @handleMarkerClick(ev.data.id)


  handleMarkerClick: (id) ->
    # To test species and photos
    # id = 'b2017c0f-33f1-40d6-aecb-37f8d359a64c'
    # To test nitrite, nitrate and phosphate
    # id = '72add3df-31db-482d-a554-d44d30cc954d'
    # Get site
    $.getJSON @ctx.apiUrl + "entities/surface_water/#{id}", (site) =>
      # Create popup
      popupView = new PopupView(ctx: @ctx, site: site).render()

      popup = L.popup({ minWidth: 420 }) # , offset: [0, -34]
        .setLatLng(L.latLng(site.location.coordinates[1], site.location.coordinates[0]))
        .setContent(popupView.el)

      @map.openPopup(popup)

  # Add control for switching type
  addBaseLayerControl: ->
     @baseLayerControl = L.control({position: 'topright'})

     @baseLayerControl.onAdd = (map) =>
       @baseLayerDiv = $(require("./BaseLayerControl.hbs")())

       @baseLayerDiv.find(".radio").on("click", =>
         null
         #@config.baseLayer = @baseLayerDiv.find("input:radio[name=base_layers]:checked").val()
         #@update()
       )
       return @baseLayerDiv.get(0)
     @baseLayerControl.addTo(@map)

  addLegendControl: () ->
    if @legend?
      @legend.removeFrom(@map)

    @legend = L.control({position: 'bottomright'})
    @legend.onAdd = (map) =>
      @legendDiv = $(require("./LegendControl.hbs")())
      @changeLegendControl("visited")

      @legendDiv.find("#selector").on 'change', (e) =>
        @fetchMap()

      return @legendDiv.get(0)

    @legend.addTo(@map)

  changeLegendControl: (type) ->
    if @legendDiv?
      query = "type=wwmc_main&display=" + type
      fullPath = @ctx.apiUrl + "maps/legend?#{query}"
      @legendDiv.find("#legend_contents").load(fullPath)

  addFilterControl: () ->
    date = new Date()
    years = [date.getFullYear()..2007]

    if @filter?
      @filter.removeFrom(@map)

    @filter = L.control({position: 'bottomright'})
    @filter.onAdd = (map) =>
      @filterDiv = $(require("./FilterControl.hbs")({years: years}))

      @filterDiv.find("#selector").on 'change', (e) =>
        @fetchMap()

      return @filterDiv.get(0)

    @filter.addTo(@map)

  fetchMap: () ->
    displayType = @legendDiv.find("#selector").val()
    filter = @filterDiv.find("#selector").val()
    if displayType != @currentDisplayType
      @changeLegendControl(displayType)
    @createDataLayer(displayType, filter)
