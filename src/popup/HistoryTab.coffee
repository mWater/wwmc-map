Tab = require('./Tab')

module.exports = class HistoryTab extends Tab
  constructor: (content) ->
    super(content)

  initialize: ->
    @content.html(require("./HistoryTab.hbs"))