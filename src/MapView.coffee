
PopupView = require './popup/PopupView'

module.exports = class MapView 
  constructor: (options) ->
    @options = options
    @ctx = options.ctx
    @currentDisplayType = null
    @currentYearFilter = null

    @map = L.map(options.el, { zoomControl: false })
    @map.setView([37, -8], 3)

    @mapType = 'wwmc_main'
    
    # Add base layer
    @baseLayer = L.bingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", { type: "Road"})
    @map.addLayer(@baseLayer)

    @searchControl = new L.esri.Controls.Geosearch({position: 'topright'}).addTo(@map)

    # # Add brand
    # brand = L.control({position: 'topleft'})
    # brand.onAdd = (map) ->
    #   html = '''
    #   <div class="map-brand">
    #     <a href="http://monitorwater.org" target="_blank">
    #       <img id="brand" src="img/brand.png" style="cursor: pointer;">
    #     </a>
    #   </div>
    #   '''
    #   return $(html).get(0)
    # brand.addTo(@map)

    # Add zoom control
    L.control.zoom({ position: "bottomleft" }).addTo(@map)

    @addLegendControl()
    @addFilterControl()
    @fetchMap(@mapType)

  createDataLayer: (mapType, displayType, yearFilter) ->
    if @currentDisplayType == displayType and @currentYearFilter == yearFilter and @mapType == mapType
      return
    @currentDisplayType = displayType
    @currentYearFilter = yearFilter
    @mapType = mapType

    if @dataLayer
      @map.removeLayer(@dataLayer)
    if @gridLayer
      @map.removeLayer(@gridLayer)

    # Add data layer
    url = @ctx.tileUrl + "?type="+@mapType+"&display=" + displayType
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
    url = @ctx.gridUrl + "?type="+@mapType+"&display=" + displayType
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

      popup = L.popup({ minWidth: 500 }) # , offset: [0, -34]
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
      @changeLegendControl(@mapType, "ph")

      @legendDiv.find("#selector").on 'change', (e) =>
        e.stopPropagation()
        @fetchMap(@mapType)

      return @legendDiv.get(0)

    @legend.addTo(@map)
  
  addMapTypeSwitcher: () -> 
    if @mapTypeSwitcher?
      @mapTypeSwitcher.removeFrom(@map)
    
    @mapTypeSwitcher = L.control({position: 'topleft'})
    @mapTypeSwitcher.onAdd = (map) =>
      @mapTypeSwitcherDiv = $(require("./Switcher.hbs")({isPlogging: @mapType == "wwmc_plogging"}))

      @mapTypeSwitcherDiv.find('#type_wwmc_main').on('click', (e) => 
        # @mapType = 'wwmc_main'
        @fetchMap('wwmc_main')
      )
      @mapTypeSwitcherDiv.find('#type_wwmc_plogging').on('click', (e) => 
        # @mapType = 'wwmc_plogging'
        @fetchMap('wwmc_plogging')
      )

      return @mapTypeSwitcherDiv.get(0)
    
    @mapTypeSwitcher.addTo(@map)

  changeLegendControl: (mapType, type) ->
    if @legendDiv?
      query = "type="+mapType+"&display=" + type
      fullPath = @ctx.apiUrl + "maps/legend?#{query}"
      @legendDiv.find("#legend_contents").load(fullPath)

      if mapType == "wwmc_plogging"
        @legendDiv.find(".panel-heading").hide()
        @filterDiv.hide()
      else
        @legendDiv.find(".panel-heading").show()
        @filterDiv?.show()

  addFilterControl: () ->
    date = new Date()
    years = [date.getFullYear()..2007]

    if @filter?
      @filter.removeFrom(@map)

    @filter = L.control({position: 'bottomright'})
    @filter.onAdd = (map) =>
      @filterDiv = $(require("./FilterControl.hbs")({years: years}))

      @filterDiv.find("#selector").on 'change', (e) =>
        e.stopPropagation()
        @fetchMap(@mapType)

      return @filterDiv.get(0)

    @filter.addTo(@map)

  fetchMap: (mapType) ->
    displayType = @legendDiv.find("#selector").val()
    filter = @filterDiv.find("#selector").val()
    if displayType != @currentDisplayType or mapType != @mapType
      @changeLegendControl(mapType, displayType)
    @createDataLayer(mapType, displayType, filter)
    @addMapTypeSwitcher()
