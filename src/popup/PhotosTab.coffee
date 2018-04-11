Tab = require('./Tab')
moment = require 'moment'

module.exports = class PhotosTab extends Tab
  constructor: (content) ->
    super(content)

  initialize: ->
    data = []

    for visitData in @visitsData
      if visitData.photos? and visitData.photos.length > 0
        photoIds = []
        for photo in visitData.photos
          photoIds.push(photo.id)
        data.push({
          photoIds: photoIds,
          date: moment(visitData.date, moment.ISO_8601).format("ll")
        })

    @content.html(require("./PhotosTab.hbs")({data:data, hasNoData: data.length == 0}))