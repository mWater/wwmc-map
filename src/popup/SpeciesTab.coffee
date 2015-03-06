Tab = require('./Tab')

module.exports = class SpeciesTab extends Tab
  constructor: (content) ->
    super(content)

  initialize: ->
    data = []
    for visitData in @visitsData
      if visitData.macroinvertebrate_data_available
        data.push {
          date: visitData.date,
          caddisflies: visitData.caddisflies,
          dobsonflies: visitData.dobsonflies,
          mayflies: visitData.mayflies,
          stoneflies: visitData.stoneflies,

          craneflies: visitData.craneflies,
          dragonflies: visitData.dragonflies,
          scuds: visitData.scuds,

          leeches: visitData.leeches,
          midges: visitData.midges,
          pounchsnails: visitData.pounchsnails,
          tubiflexworms: visitData.tubiflexworms
        }

    @content.html(require("./SpeciesTab.hbs")({data:data, hasNoData: data.length == 0}))
