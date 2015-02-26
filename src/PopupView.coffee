
module.exports = class PopupView extends Backbone.View
  constructor: (options) ->
    super()
    @options = options
    @ctx = options.ctx
    @site = options.site

  render: ->
    @$el.html(require("./PopupView.hbs")(site: @site))
    this
