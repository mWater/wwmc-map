
PopupView = require './popup/PopupView'

module.exports = class MapView 
  constructor: (options) ->
    @options = options
    @ctx = options.ctx
    @currentDisplayType = null

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
    @fetchMap("visited")

  createDataLayer: (displayType) ->
    if @currentDisplayType == displayType
      return
    @currentDisplayType = displayType

    if @dataLayer
      @map.removeLayer(@dataLayer)
    if @gridLayer
      @map.removeLayer(@gridLayer)

    # Add data layer
    @dataLayer = L.tileLayer(@ctx.tileUrl + "?type=wwmc_main&display=" + displayType)
    @dataLayer.setOpacity(0.8)

    # TODO hack for non-zoom animated tile layers
    @map._zoomAnimated = false
    @map.addLayer(@dataLayer)
    @map._zoomAnimated = true

    $(@dataLayer._container).addClass('leaflet-zoom-hide')

    # Add grid layer
    @gridLayer = new L.UtfGrid(@ctx.gridUrl + "?type=wwmc_main&display=" + displayType, { useJsonP: false })
    @map.addLayer(@gridLayer)

    # Handle clicks
    @gridLayer.on 'click', (ev) =>
      if ev.data and ev.data.id
        @handleMarkerClick(ev.data.id)


  handleMarkerClick: (id) ->
    # Get site
    $.getJSON @ctx.apiUrl + "entities/#{id}", (site) =>
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
        @fetchMap(@legendDiv.find("#selector").val())

      return @legendDiv.get(0)

    @legend.addTo(@map)

  changeLegendControl: (type) ->
    if @legendDiv?
      query = "type=wwmc_main&display=" + type
      fullPath = @ctx.apiUrl + "maps/legend?#{query}"
      @legendDiv.find("#legend_contents").load(fullPath)

  fetchMap: (displayType) ->
    @changeLegendControl(displayType)
    @createDataLayer(displayType)
