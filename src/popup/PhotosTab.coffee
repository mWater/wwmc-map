Tab = require('./Tab')

module.exports = class PhotosTab extends Tab
  constructor: (content) ->
    super(content)

  initialize: ->
    @content.html(require("./PhotosTab.hbs"))