moment = require 'moment'
unitToString = require('./../unit').unitToString

posterOptions = [
  { "id": "4gEt9hY","label": {"en": "Yes","_base": "en"}},
  { "id": "sxRjm6r", "label": {"en": "No","_base": "en"}}
]

affiliations = [
  { "id": "vbvSy2S", "label": { "en": "School", "_base": "en" }},
  { "id": "CdbSvWD", "label": { "en": "Organization", "_base": "en"}},
  { "id": "vShkZmm", "label": { "en": "Group name", "_base": "en" }},
  { "id": "78q4BkC", "label": { "en": "None", "_base": "en" }}
]
module.exports = class FlushingPopup extends Backbone.View
    constructor: (options) ->
        super()
        @options = options
        @ctx = options.ctx
        @response = options.response

    render: ->
        flushingData = createFlushingChallangeData(@response)
        photoIds = []
        data = {
            date: if flushingData.date.length <= 10 then moment(flushingData.date, moment.ISO_8601).format("ll") else moment(flushingData.date, moment.ISO_8601).format("lll")
        }

        if flushingData.affiliation?
            data["affiliation"] = affiliations.filter((d) -> d.id == flushingData.affiliation)[0].label.en

        if flushingData.participants?
            data["participants"] = flushingData.participants

        if flushingData.affiliation_name?
            data["affiliation_name"] = flushingData.affiliation_name

        if flushingData.poster?
            data["poster"] = posterOptions.filter((d) -> d.id == flushingData.poster)[0].label.en

        if flushingData.pictures? and flushingData.pictures.length > 0

            for photo in flushingData.pictures
                photoIds.push(photo.id)

        @$el.html(require("./FlushingPopup.hbs")(data: data, photoIds: photoIds))
        this

flushingFields = [
  {questionId: '9e40eb8f50c8417bb0338c884f3916a1', field: 'date'}
  {questionId: 'b907c273299a40c8afbfa0fb00ec63bf', field: 'affiliation'}
  {questionId: '29814a936c6941c7b16a4c8803412f31', field: 'affiliation_name'}
  {questionId: '1f4481c41936423fb957cb705c464211', field: 'participants'}
  {questionId: 'cbe19b8328374cb38da6494ba922f0f3', field: 'poster'}
  {questionId: 'f41bcf066ccf41598a6decf8f0624984', field: 'pictures'}
]

createFlushingChallangeData = (response) ->
    flushingData = {}
    for field in flushingFields
      answer = response.data[field.questionId]
      # If the answer exists
      if answer? and answer.value?
        # And it's a choice
        if field.choiceId?
          # And there can be multiple values
          if field.multi
            # We check if the choiceId is part of the value
            flushingData[field.field] = answer.value.indexOf(field.choiceId) >= 0
          else
            # We check if the choiceId is equal to the value
            flushingData[field.field] = answer.value == field.choiceId
        else
          # We simply assign the value (good for all measures)
          flushingData[field.field] = answer.value

    return flushingData
