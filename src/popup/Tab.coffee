
module.exports = class Tab
  constructor: (content) ->
    @content = content
    @initialized = false
    @visitsData = null

  show: () ->
    @needToBeShown = true
    @update()

  setVisitsData: (visitsData) ->
    @visitsData = visitsData
    @update()

  update: ->
    if @needToBeShown and @visitsData and not @initialized
      @initialized = true
      @initialize()

  initialize: () ->
    null
