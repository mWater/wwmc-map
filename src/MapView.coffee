
PopupView = require './popup/PopupView'

module.exports = class MapView 
  constructor: (options) ->
    @options = options
    @ctx = options.ctx

    @map = L.map(options.el)
    @map.setView([37, 8], 4)
    
    # Add base layer
    @baseLayer = L.bingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", { type: "Road"})
    @map.addLayer(@baseLayer)

    # Add data layer
    dataLayer = L.tileLayer(@ctx.apiUrl + "maps/tiles/{z}/{x}/{y}.png?type=wwmc_main")
    dataLayer.setOpacity(0.8)

    # TODO hack for non-zoom animated tile layers
    @map._zoomAnimated = false
    @map.addLayer(dataLayer)
    @map._zoomAnimated = true
    $(dataLayer._container).addClass('leaflet-zoom-hide')

    # Add grid layer
    @gridLayer = new L.UtfGrid(@ctx.apiUrl + "maps/tiles/{z}/{x}/{y}.grid.json?type=wwmc_main&display=visited", { useJsonP: false })
    @map.addLayer(@gridLayer)

    # Handle clicks
    @gridLayer.on 'click', (ev) =>
      if ev.data and ev.data.id
        @handleMarkerClick(ev.data.id)

    @searchControl = new L.esri.Controls.Geosearch({position: 'topright'}).addTo(@map)

    #@addBaseLayerControl()
    @addLegendControl()
    @fetchMap("Visit")
    @addColorCodingParameterControl()


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

  addColorCodingParameterControl: ->
    @colorCodingParameterControl = L.control({position: 'topright'})

    @colorCodingParameterControl.onAdd = (map) =>
      @colorCodingParameterDiv = $(require("./ColorCodingParameterControl.hbs")())

      @colorCodingParameterDiv.find("#selector").on 'change', (e) =>
        selected = $('#selector option').filter(':selected').text()
        @fetchMap(selected)

      return @colorCodingParameterDiv.get(0)
    @colorCodingParameterControl.addTo(@map)

  addLegendControl: () ->
    if @legend?
      @legend.removeFrom(@map)

    @legend = L.control({position: 'bottomright'})
    @legend.onAdd = (map) =>
      @legendDiv = $('<div/>')
      @changeLegendControl("Visit")
      return @legendDiv.get(0)

    @legend.addTo(@map)

  changeLegendControl: (type) ->
    if @legendDiv?
      if type.toLowerCase() == "turbidity"
        html = require("./TurbidityLegend.hbs")()
      else if type.toLowerCase() == "temperature"
        html = require("./TemperatureLegend.hbs")()
      else if type.toLowerCase() == "ph"
        html = require("./pHLegend.hbs")()
      else if type.toLowerCase() == "oxygen"
        html = require("./OxygenLegend.hbs")()
      else
        #html = require("./VisitLegend.hbs")()
        query = "type=wwmc_main&display=visited"
        html = L.DomUtil.create('div', 'map-info map-legend')
        fullPath = @ctx.apiUrl + "maps/legend?#{query}"
        console.log fullPath
        $(html).load(fullPath)

      @legendDiv.html(html)

  fetchMap: (type) ->
    @changeLegendControl(type)

    #TODO
    # query the map for the right layer based on type
    #if type.toLowerCase() == "turbidity"
    #  ...
    #else if type.toLowerCase() == "temperature"
    #  ...
    #else if type.toLowerCase() == "ph"
    #  ...
    #else if type.toLowerCase() == "oxygen"
    #  ...
    #else
    #  ...



  #   @update()

  # update: =>
  #   if @hasChanged('baseLayer')
  #     if @baseLayer
  #       @map.removeLayer(@baseLayer)
  #       @baseLayer = null

  #     switch @config.baseLayer
  #       when "bing_road"
  #         @baseLayer = L.bingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", { type: "Road"})
  #       when "bing_aerial"
  #         @baseLayer = L.bingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", { type: "AerialWithLabels"})
  #     @map.addLayer(@baseLayer)
  #     @baseLayer.bringToBack()

  #   if @hasChanged('display')
  #     @$("#map").toggle(@config.display == 'map')
  #     @$("#list").toggle(@config.display == 'list')

  #   if @hasChanged('mapType', 'filters', 'for', 'radius')
  #     @updateData()

  #   # Save updated config so we can see what has changed
  #   @updatedConfig = _.cloneDeep(@config)

  # # Check if any of the specified keys in the config have since last updated
  # hasChanged: (keys...) ->
  #   return not _.isEqual(_.pick(@config, keys), _.pick(@updatedConfig, keys))

  # updateData: ->    
  #   if @dataLayers
  #     for layer in @dataLayers
  #       @map.removeLayer(layer)
  #     @dataLayers = null

  #   if @gridLayer
  #     @map.removeLayer(@gridLayer)
  #     @gridLayer = null

  #   if @legend
  #     @map.removeControl(@legend)
  #     @legend = null

  #   if @info
  #     @map.removeControl(@info)
  #     @info = null

  #   mainDataType = @config.mapType
  #   if @config.mapType == "water_access"
  #     mainDataType = "functional_status"
  #   if @config.mapType == "safe_water_access"
  #     mainDataType = "ecoli_status"

  #   query = "type=" + mainDataType + "&client=" + @ctx.login.client
  #   if @config.for
  #     query += "&selector=" + encodeURIComponent(JSON.stringify( { "created.for": { $in: @config.for } }))

  #   @dataLayers = [L.tileLayer(@ctx.apiUrl + "maps/tiles/{z}/{x}/{y}.png?#{query}")]
  #   @gridLayer = new L.UtfGrid(@ctx.apiUrl + "maps/tiles/{z}/{x}/{y}.grid.json?#{query}", { useJsonP: false })

  #   # Add extra layer for special maps
  #   if @config.mapType in ["water_access", 'safe_water_access']
  #     query = "type=" + @config.mapType + "&client=" + @ctx.login.client
  #     if @config.for
  #       query += "&selector=" + encodeURIComponent(JSON.stringify( { "created.for": { $in: @config.for } }))
  #     query += "&radius=" + @config.radius

  #     # Need to zoom in to see water access
  #     extraLayer = L.tileLayer(@ctx.apiUrl + "maps/tiles/{z}/{x}/{y}.png?#{query}", { minZoom: 7 })
  #     extraLayer.setOpacity(0.5)
  #     @dataLayers.splice(0, 0, extraLayer)

  #   for layer in @dataLayers
  #     @map.addLayer(layer)

  #   @map.addLayer(@gridLayer)

  #   @gridLayer.on 'click', (ev) =>
  #     if ev.data and ev.data.id
  #       @ctx.db.sites.findOne {_id: ev.data.id.replace(/\-/g, "")}, (site) =>
  #         if not site
  #           return alert("Site not found " + ev.data.id)

  #         siteCopy = _.cloneDeep(site)

  #         new ActionCancelModal(
  #           title: "Site Details"
  #           action: "Save"
  #           view: new SiteView(model: siteCopy, ctx: @ctx).render()
  #           onAction: =>
  #             # Upsert and redraw
  #             @ctx.db.sites.upsert siteCopy, =>
  #               for layer in @dataLayers
  #                 layer.redraw()
  #               @gridLayer.redraw()
  #             , @ctx.error
  #         ).show()
  #       , @ctx.error

  #   @gridLayer.on 'mouseover', (ev) =>
  #     if ev.data
  #       @updateInfo(ev.data.id)

  #   @gridLayer.on 'mouseout', (ev) =>
  #     @updateInfo()

  #   @legend = L.control({position: 'bottomright'})
  #   @legend.onAdd = (map) =>
  #     div = L.DomUtil.create('div', 'map-info map-legend')
  #     $(div).load(@ctx.apiUrl + "maps/legend?#{query}")
  #     return div
  #   @legend.addTo(@map)

  #   @info = L.control({position: 'bottomleft'})
  #   @info.onAdd = (map) =>
  #     div = L.DomUtil.create('div', 'map-info site-info')
  #     @infoDiv = $(div).hide()
  #     @updateInfo()
  #     return div
  #   @info.addTo(@map)    

  # updateInfo: (siteId) ->
  #   @displayedSiteId = siteId
  #   @displaySiteInfo() # Run throttled function

  # displaySiteInfo: =>
  #   if @displayedSiteId
  #     @ctx.db.sites.findOne {_id: @displayedSiteId.replace(/\-/g, "")}, (site) =>
  #       if site
  #         $(@info.getContainer()).show()
  #         html = "<h4>Site " + site.code + "</h4>"
  #         if site.name
  #           html += "<div><b>" + site.name + "</b></div>" # TODO template
  #         if site.desc
  #           html += "<div>" + site.desc + "</div>" # TODO template
  #         if site.type
  #           html += "<div>" + site.type[0] + (if site.type[1] then " - " + site.type[1] else "") + "</div>" # TODO template
  #         if site.created.for
  #           html += "<div><i>Group: </i>" + site.created.for + "</div>" # TODO template

  #         @infoDiv.html(html)  
  #   else
  #     $(@info.getContainer()).hide()