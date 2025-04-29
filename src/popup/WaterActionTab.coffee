Tab = require('./Tab')
unitToString = require('./../unit').unitToString
moment = require 'moment'

durations = [
  {"id":"eJzaU1w","label":{"en":"5 minutes","_base":"en"}},
  {"id":"dBF76uD","label":{"en":"15 minutes","_base":"en"}},
  {"id":"sekt45H","label":{"en":"30 minutes","_base":"en"}},
  {"id":"jlCLQTQ","label":{"en":"1+ hour","_base":"en"}}
]

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

# Mapping from action IDs to human-readable labels
ACTION_LABELS = {
  'flushing': 'Flushing',
  'TKdfEkd': 'Beach/river cleanup',
  'ASR2hr3': 'Storm Drain Activity',
  'lSTK7fU': 'Education',
  'NzRwvgQ': 'Tree planting',
  'f1PswKP': 'Habitat Restoration',
  'B5pN6Yc': 'Other (please specify)'
}

module.exports = class WaterActionTab extends Tab
  constructor: (content) ->
    super(content)
    @actions = []

  initialize: ->
    @content.html(require("./WaterActionTab.hbs")())

    @subContent = @content.find("#subContent")

    @content.find("#waterActionSelector").on 'change', (e) =>
      selected = $('#waterActionSelector option').filter(':selected')[0].value
      @render(selected)

    @render('plogging')

  setActionsData: (actions) ->
    @actions = actions
    @render()

  render: ->
    data = []
    for action in @actions
      data.push {
        date: if action.date.length <= 10 then moment(action.date, moment.ISO_8601).format("ll") else moment(action.date, moment.ISO_8601).format("lll"),
        action_type: ACTION_LABELS[action.action_type] || action.action_type,
        participants: action.participants,
        response: action.response,
        form: action.form
      }
    @content.html(require("./WaterActionTable.hbs")({ data: data, hasNoData: data.length == 0 }))

    # Attach click handler for modal
    _this = this
    @content.find('.view-details').off('click').on('click', (e) ->
      e.preventDefault()
      idx = parseInt($(e.currentTarget).data('index'))
      action = _this.actions[idx]
      _this.showActionModal(action)
    )

  showActionModal: (action) ->
    # Remove any existing modal
    $('#waterActionModal').remove()
    html = ''
    if action.form == 'flushing' or action.form == '2e5325c13c80416db098e77a14eef2c3'
      data = action.response.data
      # Affiliation mapping
      affiliationMap = {
        'vbvSy2S': 'School',
        'CdbSvWD': 'Organization',
        'vShkZmm': 'Group name',
        '78q4BkC': 'None'
      }
      posterMap = {
        '4gEt9hY': 'Yes',
        'sxRjm6r': 'No'
      }
      affiliation = affiliationMap[data['b907c273299a40c8afbfa0fb00ec63bf']?.value] or ''
      affiliationName = data['29814a936c6941c7b16a4c8803412f31']?.value or ''
      poster = posterMap[data['cbe19b8328374cb38da6494ba922f0f3']?.value] or ''
      posterImages = data['f41bcf066ccf41598a6decf8f0624984']?.value or []
      posterImgTag = ''
      if posterImages.length > 0 and posterImages[0]?.id?
        posterImgTag = "<img class='img-thumbnail' src='https://api.mwater.co/v3/images/#{posterImages[0].id}?h=100' style='max-height:100px' onerror=\"this.onerror=null;this.src='img/no-image-icon.jpg';\">"
      html = """
      <div class='modal fade' id='waterActionModal' tabindex='-1' role='dialog'>
        <div class='modal-dialog' role='document'>
          <div class='modal-content'>
            <div class='modal-header'>
              <h4 class='modal-title'>Flushing Challenge Details</h4>
              <button type='button' class='close' data-dismiss='modal'>&times;</button>
            </div>
            <div class='modal-body'>
              <b>Date:</b> #{moment(action.date).format('ll')}<br/>
              <b>Participants:</b> #{action.participants or ''}<br/>
              <b>Affiliation:</b> #{affiliation}<br/>
              <b>Affiliation Name:</b> #{affiliationName}<br/>
              <b>Poster:</b> #{poster}<br/>
              #{posterImgTag}
            </div>
            <div class='modal-footer'>
              <button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button>
            </div>
          </div>
        </div>
      </div>
      """
    else if action.form == 'd1c360082dfc46b9bb1fd0ff582d6c06' or action.form == '3203d0e5b2ec47418fc7a37466dff7ba'
      data = action.response.data
      html = """
      <div class='modal fade' id='waterActionModal' tabindex='-1' role='dialog'>
        <div class='modal-dialog' role='document'>
          <div class='modal-content'>
            <div class='modal-header'>
              <h4 class='modal-title'>Action Details</h4>
              <button type='button' class='close' data-dismiss='modal'>&times;</button>
            </div>
            <div class='modal-body'>
              <b>Date:</b> #{moment(action.date).format('ll')}<br/>
              <b>Action Type:</b> #{ACTION_LABELS[action.action_type] or action.action_type}<br/>
              <b>Participants:</b> #{action.participants or ''}<br/>
      """
      # Field IDs for each form
      isVisit = action.form == 'd1c360082dfc46b9bb1fd0ff582d6c06'
      isPlogging = action.form == '3203d0e5b2ec47418fc7a37466dff7ba'
      # Beach/river cleanup
      if action.action_type == 'TKdfEkd'
        weight = if isVisit then data['f326ecae8ca949789d553b4673425431']?.value else data['f326ecae8ca949789d553b4673425431']?.value
        units = if isVisit then data['f326ecae8ca949789d553b4673425431']?.units else data['f326ecae8ca949789d553b4673425431']?.units
        unitLabel = if units == 'G15wjwt' or units == 'yjExEDy' then 'lbs' else if units == 'pka2kmE' or units == 'zrbqMpW' then 'kg' else ''
        if weight?
          html += "<b>Total Weight of Litter Removed:</b> #{weight} #{unitLabel}<br/>"
      # Storm Drain Activity
      if action.action_type == 'ASR2hr3'
        weight = if isVisit then data['47e85277f6c940f8bccf27ec4ec0c85b']?.value else data['47e85277f6c940f8bccf27ec4ec0c85b']?.value
        units = if isVisit then data['47e85277f6c940f8bccf27ec4ec0c85b']?.units else data['47e85277f6c940f8bccf27ec4ec0c85b']?.units
        unitLabel = if units == 'yjExEDy' or units == 'G15wjwt' then 'lbs' else if units == 'zrbqMpW' or units == 'pka2kmE' then 'kg' else ''
        if weight?
          html += "<b>Total Weight of Litter Removed from Storm Drain:</b> #{weight} #{unitLabel}<br/>"
      # Tree planting
      if action.action_type == 'NzRwvgQ'
        trees = if isVisit then data['626fd436c5ea48fb9ada22094eea9005']?.value else data['cb972ebaf6ac45718eea988160f2c6f8']?.value
        nativeSpecies = if isVisit then data['9c1e366f1c234381884bfe5df94a4264']?.value else data['420079c0c9834ae0b4abd2d21a7ab452']?.value
        if trees?
          html += "<b>Trees planted:</b> #{trees}<br/>"
        if nativeSpecies?
          html += "<b>Native Species Planted:</b> #{if nativeSpecies == 'KYDFjR8' then 'Yes' else 'No'}<br/>"
      # Habitat Restoration
      if action.action_type == 'f1PswKP'
        invasives = if isVisit then data['4c949c2520b34ac9bee420e2bcea4b13']?.value else data['91b2ec06b678413d89ff6a2afcece01f']?.value
        nativeSpecies = if isVisit then data['9c1e366f1c234381884bfe5df94a4264']?.value else data['420079c0c9834ae0b4abd2d21a7ab452']?.value
        if invasives?
          html += "<b>Invasives Species Removal:</b> #{if invasives == 'jzfqdme' then 'Yes' else 'No'}<br/>"
        if nativeSpecies?
          html += "<b>Native Species Planted:</b> #{if nativeSpecies == 'KYDFjR8' then 'Yes' else 'No'}<br/>"
      html += """
            </div>
            <div class='modal-footer'>
              <button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button>
            </div>
          </div>
        </div>
      </div>
      """
    else
      # Simple details for other actions
      html = """
      <div class='modal fade' id='waterActionModal' tabindex='-1' role='dialog'>
        <div class='modal-dialog' role='document'>
          <div class='modal-content'>
            <div class='modal-header'>
              <h4 class='modal-title'>Action Details</h4>
              <button type='button' class='close' data-dismiss='modal'>&times;</button>
            </div>
            <div class='modal-body'>
              <b>Date:</b> #{moment(action.date).format('ll')}<br/>
              <b>Action Type:</b> #{ACTION_LABELS[action.action_type] or action.action_type}<br/>
              <b>Participants:</b> #{action.participants or ''}<br/>
              <pre style='background:#f8f8f8;max-height:200px;overflow:auto;'>#{JSON.stringify(action.response, null, 2)}</pre>
            </div>
            <div class='modal-footer'>
              <button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button>
            </div>
          </div>
        </div>
      </div>
      """
    # Append and show modal
    $('body').append(html)
    $('#waterActionModal').modal('show')

  setLoading: ->
    @content.html("""
      <div class='text-center' style='padding: 40px 0;'>
        <i class='fa fa-spinner fa-spin' style='font-size:2em;'></i><br/>
        <span class='text-muted'>Loading water actions...</span>
      </div>
    """)
