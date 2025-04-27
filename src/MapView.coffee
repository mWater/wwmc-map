PopupView = require './popup/PopupView'
FlushingPopup = require './popup/FlushingPopup'

module.exports = class MapView
  constructor: (options) ->
    @options = options
    @ctx = options.ctx
    @currentDisplayType = null
    @currentYearFilter = null
    @currentActionType = null

    @currentWaterActionFilter = null

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
    @addFilterControl(@mapType)
    @fetchMap(@mapType)

  createDataLayer: (mapType, displayType, filters) ->
    if mapType == "wwmc_main"
      @currentDisplayType = displayType
      @currentYearFilter = filters.yearFilter
    else
      @currentDisplayType = displayType
      @currentActionType = filters.action_type

    @mapType = mapType

    if @dataLayer
      @map.removeLayer(@dataLayer)
    if @gridLayer
      @map.removeLayer(@gridLayer)

    # Add data layer
    url = @ctx.tileUrl + "?type="+@mapType+"&display=" + displayType
    if filters.yearFilter != ""
      url += "&year=" + filters.yearFilter
    if mapType == 'wwmc_water_actions'
      actionType = filters.action_type or 'all'
      url += "&action_type=" + actionType
      # For backward compatibility
      if actionType == 'all'
        url += "&water_action_type=plogging"
      else if actionType == 'flushing'
        url += "&water_action_type=flushing"

    @dataLayer = L.tileLayer(url)
    @dataLayer.setOpacity(0.8)

    # TODO hack for non-zoom animated tile layers
    @map._zoomAnimated = false
    @map.addLayer(@dataLayer)
    @map._zoomAnimated = true

    $(@dataLayer._container).addClass('leaflet-zoom-hide')

    # Add grid layer
    url = @ctx.gridUrl + "?type="+@mapType+"&display=" + displayType
    if filters.yearFilter != ""
      url += "&year=" + filters.yearFilter
    if mapType == 'wwmc_water_actions'
      actionType = filters.action_type or 'all'
      url += "&action_type=" + actionType
      # For backward compatibility
      if actionType == 'all'
        url += "&water_action_type=plogging"
      else if actionType == 'flushing'
        url += "&water_action_type=flushing"
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

    filter = @filterDiv.find("#selector").val()
    if @mapType == 'wwmc_water_actions' and filter == 'flushing'
        $.getJSON @ctx.apiUrl + "responses/#{id}", (response) =>
            # Create popup
            popupView = new FlushingPopup(ctx: @ctx, response: response).render()
            console.log(response)
            popup = L.popup({ minWidth: 500 }) # , offset: [0, -34]
                .setLatLng(L.latLng(response.data['de5c721a4e0b445c8bf8cccd46cbfcc5'].value.latitude, response.data['de5c721a4e0b445c8bf8cccd46cbfcc5'].value.longitude))
                .setContent(popupView.el)

            @map.openPopup(popup)
    else
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
      @mapTypeSwitcherDiv = $(require("./Switcher.hbs")({isWaterAction: @mapType == "wwmc_water_actions"}))

      @mapTypeSwitcherDiv.find('#type_wwmc_main').on('click', (e) =>
        # @mapType = 'wwmc_main'
        @fetchMap('wwmc_main')
      )
      @mapTypeSwitcherDiv.find('#type_wwmc_water_action').on('click', (e) =>
        # @mapType = 'wwmc_water_actions'
        @fetchMap('wwmc_water_actions')
        # @fetchMap('wwmc_water_actions')
      )

      return @mapTypeSwitcherDiv.get(0)

    @mapTypeSwitcher.addTo(@map)

  changeLegendControl: (mapType, type) ->
    if @legendDiv?
      if mapType == "wwmc_water_actions"
        @legendDiv.hide()
      else
        query = "type="+mapType+"&display=" + type
        fullPath = @ctx.apiUrl + "maps/legend?#{query}"
        @legendDiv.find("#legend_contents").load(fullPath)
        @legendDiv.show()
        @legendDiv.find(".panel-heading").show()
        @filterDiv?.show()

  addFilterControl: (mapType) ->
    date = new Date()
    years = [date.getFullYear()..2015]

    if @filter?
      @filter.removeFrom(@map)

    @filter = L.control({position: 'bottomright'})

    if mapType == "wwmc_main"
      filterDiv = $(require("./FilterControl.hbs")({years: years}))
    else
      filterDiv = $(require("./WaterActionFilterControl.hbs")({years: years}))

    @filter.onAdd = (map) =>
      @filterDiv = filterDiv

      # Set the year selector to the current year filter value if it exists
      if @currentYearFilter
        @filterDiv.find("#year_selector").val(@currentYearFilter)

      @filterDiv.find("#selector").on 'change', (e) =>
        e.stopPropagation()
        @fetchMap(mapType)

      @filterDiv.find("#year_selector").on 'change', (e) =>
        e.stopPropagation()
        @currentYearFilter = @filterDiv.find("#year_selector").val()
        @fetchMap(mapType)

      return @filterDiv.get(0)

    @filter.addTo(@map)


  fetchMap: (mapType) ->
    displayType = @legendDiv.find("#selector").val()
    filters = {}
    
    # Get the year filter value from the current selector
    yearFilter = @filterDiv.find("#year_selector").val()
    @currentYearFilter = yearFilter if yearFilter
    
    if mapType == 'wwmc_main'
      filters.yearFilter = yearFilter
    else if mapType == 'wwmc_water_actions'
      filters.action_type = @filterDiv.find("#selector").val() or 'all'
      filters.yearFilter = yearFilter

    if mapType != @mapType
      @addFilterControl(mapType)

    if displayType != @currentDisplayType or mapType != @mapType
      @changeLegendControl(mapType, displayType)

    @createDataLayer(mapType, displayType, filters)
    @addMapTypeSwitcher()
