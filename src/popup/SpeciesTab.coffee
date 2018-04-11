Tab = require('./Tab')
moment = require 'moment'

module.exports = class SpeciesTab extends Tab
  constructor: (content) ->
    super(content)

  initialize: ->
    data = []
    for visitData in @visitsData
      if visitData.macroinvertebrate_data_available
        data.push {
          date: moment(visitData.date, moment.ISO_8601).format("ll"),
          caddisflies: visitData.caddisflies_present,
          dobsonflies: visitData.dobsonflies_present,
          mayflies: visitData.mayflies_present,
          stoneflies: visitData.stoneflies_present,

          craneflies: visitData.craneflies_present,
          dragonflies: visitData.dragonflies_present,
          scuds: visitData.scuds_present,

          leeches: visitData.leeches_present,
          midges: visitData.midges_present,
          pounchsnails: visitData.pounch_snails_present,
          tubiflexworms: visitData.tubiflex_worms_present
        }

    @content.html(require("./SpeciesTab.hbs")({data:data, hasNoData: data.length == 0}))
