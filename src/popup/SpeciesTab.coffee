Tab = require('./Tab')

module.exports = class SpeciesTab extends Tab
  constructor: (content) ->
    super(content)

  initialize: ->
    @content.html(require("./SpeciesTab.hbs"))