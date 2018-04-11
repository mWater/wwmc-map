unitToString = require('./../unit').unitToString
DataTab = require('./DataTab')
SpeciesTab = require('./SpeciesTab')
PhotosTab = require('./PhotosTab')
HistoryTab = require('./HistoryTab')

module.exports = class PopupView extends Backbone.View
  constructor: (options) ->
    super()
    @options = options
    @ctx = options.ctx
    @site = options.site

  render: ->
    @$el.html(require("./PopupView.hbs")(site: @site))

    @dataTab = new DataTab(@$el.find("#dataSection"))
    @photosTab = new PhotosTab(@$el.find("#photosSection"))
    @speciesTab = new SpeciesTab(@$el.find("#speciesSection"))
    @historyTab = new HistoryTab(@$el.find("#historySection"))

    #Only create the visual for a tab when required
    @dataTab.show()
    @$el.find("#speciesTab").on('show.bs.tab', (e) =>
      @speciesTab.show()
    )
    @$el.find("#photosTab").on('show.bs.tab', (e) =>
      @photosTab.show()
    )
    @$el.find("#historyTab").on('show.bs.tab', (e) =>
      @historyTab.show()
    )

    # Show site photo
    if @site.photo
      if @$el.find("#image").html() == ""
        thumbnail = "<img height='100' class='thumb' src='#{this.ctx.apiUrl}images/" + @site.photo.id + "?h=100' >"
        @$el.find("#image").html(thumbnail)

    # Get the visits data
    # Through the response of a form (id: d1c360082dfc46b9bb1fd0ff582d6c06) with entity question (id: ee96dc4554b2431d8a2d7a8b418c23f8)
    siteId = @site._id
    formId = 'd1c360082dfc46b9bb1fd0ff582d6c06'
    entityQuestionId = 'ee96dc4554b2431d8a2d7a8b418c23f8'
    # All the responses with the right form and the right siteId for the entityQuestion
    responseFilter = "{\"form\":\"#{formId}\",\"data.#{entityQuestionId}.value\":\"#{siteId}\"}"
    fullPath = @ctx.apiUrl + "responses?filter=#{responseFilter}"
    $.getJSON fullPath, (responses) =>
      # Sort responses
      responses = _.sortBy(responses, (r) -> r.submittedOn)
      visitsData = createVisitsData(responses)

      @visitsData = visitsData
      @dataTab.setVisitsData(visitsData)
      @photosTab.setVisitsData(visitsData)
      @speciesTab.setVisitsData(visitsData)
      @historyTab.setVisitsData(visitsData)

    this

# Purely hardcoded fields from the form data
# The form cannot change or this will be wrong
questionAndFields = [
  {questionId: 'efb614336f504f31a312581e2283a8b2', field: 'date'}

  {questionId: 'f4725a40f1474bd6a9c16df63865e1d8', field: 'turbidity'}
  {questionId: 'd5cf3fc485164dd5b9ef0edbaacfdeac', field: 'water_temperature'}
  {questionId: '446ad384f0d64fc9baf2b810c5fba2ac', field: 'dissolved_oxygen'}
  {questionId: 'ea33bee55ce24dc1a2eaab2c5a6e679b', field: 'dissolved_oxygen_saturation'}
  {questionId: 'e05e0afdff824cf3bbc3aefcfadc96ee', field: 'ph'}
  #{questionId: 'dd639fb14f60480b9935f51f80a13a7e', field: 'salinity'}

  {questionId: 'd03de1a11d324de5b3b1d197f24c1519', field: 'nitrate'}
  {questionId: 'ec09f13bc97a433ba8f89c1c34273a9f', field: 'nitrite'}
  {questionId: 'eff5e181612541f9b04b33d39a17715d', field: 'phosphate'}
  {questionId: 'd28f9ed8ac2445f9900e6cb231d136d9', field: 'photos'}

  {questionId: 'f146785697ac4d29821a6969e909ee20', choiceId: 'He4yspy', field: 'macroinvertebrate_data_available', multi: false}

  {questionId: 'f02ec505ef114deca7e7735247b7821b', choiceId: '8R5P9ST', field: 'caddisflies_present', multi: true}
  {questionId: 'f02ec505ef114deca7e7735247b7821b', choiceId: 'dbBRlKD', field: 'dobsonflies_present', multi: true}
  {questionId: 'f02ec505ef114deca7e7735247b7821b', choiceId: '7ZU8Yjg', field: 'mayflies_present', multi: true}
  {questionId: 'f02ec505ef114deca7e7735247b7821b', choiceId: '9QfVGsF', field: 'stoneflies_present', multi: true}
  {questionId: 'fc27a75ece87477aa59f0193b8afd4ce', choiceId: 'kkEEkks', field: 'craneflies_present', multi: true}
  {questionId: 'fc27a75ece87477aa59f0193b8afd4ce', choiceId: 'h7yvJDd', field: 'dragonflies_present', multi: true}
  {questionId: 'fc27a75ece87477aa59f0193b8afd4ce', choiceId: 'Rx7u6Tp', field: 'scuds_present', multi: true}
  {questionId: 'ce3c95486d214836823d030386a64e50', choiceId: 'h7yvJDd', field: 'leeches_present', multi: true}
  {questionId: 'ce3c95486d214836823d030386a64e50', choiceId: 'Rx7u6Tp', field: 'midges_present', multi: true}
  {questionId: 'ce3c95486d214836823d030386a64e50', choiceId: 'AK3NYkv', field: 'pounch_snails_present', multi: true}
  {questionId: 'ce3c95486d214836823d030386a64e50', choiceId: 'qxmSzcj', field: 'tubiflex_worms_present', multi: true}
]

# Extract the data from the response and put it in the old format (I only changed magnitude to quantity and unit to units)
createVisitsData = (responses) ->
  # For each response we pass each questAndField entry
  return _.map(responses, (response) ->
    visitData = {}
    for questionAndField in questionAndFields
      answer = response.data[questionAndField.questionId]
      # If the answer exists
      if answer? and answer.value?
        # And it's a choice
        if questionAndField.choiceId?
          # And there can be multiple values
          if questionAndField.multi
            # We check if the choiceId is part of the value
            visitData[questionAndField.field] = answer.value.indexOf(questionAndField.choiceId) >= 0
          else
            # We check if the choiceId is equal to the value
            visitData[questionAndField.field] = answer.value == questionAndField.choiceId
        else
          # We simply assign the value (good for all measures)
          visitData[questionAndField.field] = answer.value
    return visitData
  )

